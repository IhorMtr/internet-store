begin;

-- ========== Constraints ==========

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_orders_order_date_not_future'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint chk_orders_order_date_not_future
      check (order_date <= current_date);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_orders_total_amount'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint chk_orders_total_amount
      check (total_amount >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_order_items_line_amount'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint chk_order_items_line_amount
      check (line_amount >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_payments_payment_date_not_future'
      and conrelid = 'public.payments'::regclass
  ) then
    alter table public.payments
      add constraint chk_payments_payment_date_not_future
      check (payment_date <= current_date);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_deliveries_delivery_date_not_future'
      and conrelid = 'public.deliveries'::regclass
  ) then
    alter table public.deliveries
      add constraint chk_deliveries_delivery_date_not_future
      check (delivery_date <= current_date);
  end if;
end $$;

-- ========== Functions ==========

create or replace function public.pr_create_order(
  p_customer_id integer,
  p_order_date date,
  p_items jsonb
)
returns integer
language plpgsql
as $$
declare
  v_order_id integer;
  v_total_amount numeric(12, 2) := 0;
  v_item jsonb;
  v_product_id integer;
  v_quantity integer;
  v_sale_price numeric(12, 2);
  v_discount numeric(5, 2);
  v_stock_quantity integer;
  v_line_amount numeric(12, 2);
begin
  if not exists (
    select 1
    from public.customers
    where customer_id = p_customer_id
  ) then
    raise exception 'Customer with ID % does not exist', p_customer_id;
  end if;

  if p_order_date > current_date then
    raise exception 'Order date cannot be later than current date';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  insert into public.orders (
    customer_id,
    order_date,
    status,
    total_amount
  )
  values (
    p_customer_id,
    p_order_date,
    'Created',
    0
  )
  returning order_id into v_order_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    if not (v_item ? 'product_id') or not (v_item ? 'quantity') then
      raise exception 'Each order item must contain product_id and quantity';
    end if;

    v_product_id := (v_item ->> 'product_id')::integer;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity <= 0 then
      raise exception 'Order item quantity must be greater than 0';
    end if;

    select
      price,
      discount,
      stock_quantity
    into
      v_sale_price,
      v_discount,
      v_stock_quantity
    from public.products
    where product_id = v_product_id
    for update;

    if not found then
      raise exception 'Product with ID % does not exist', v_product_id;
    end if;

    if v_stock_quantity < v_quantity then
      raise exception 'Not enough stock for product ID %', v_product_id;
    end if;

    v_line_amount := round(
      (v_quantity * v_sale_price * (100 - v_discount) / 100)::numeric,
      2
    );

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      sale_price,
      discount,
      line_amount
    )
    values (
      v_order_id,
      v_product_id,
      v_quantity,
      v_sale_price,
      v_discount,
      v_line_amount
    );

    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where product_id = v_product_id;

    v_total_amount := v_total_amount + v_line_amount;
  end loop;

  update public.orders
  set total_amount = v_total_amount
  where order_id = v_order_id;

  return v_order_id;
end;
$$;

-- ========== Functions ==========

create or replace function public.pr_register_delivery(
  p_supplier_id integer,
  p_delivery_date date,
  p_invoice_number varchar,
  p_items jsonb
)
returns integer
language plpgsql
as $$
declare
  v_delivery_id integer;
  v_item jsonb;
  v_product_id integer;
  v_quantity integer;
  v_supply_price numeric(12, 2);
begin
  if not exists (
    select 1
    from public.suppliers
    where supplier_id = p_supplier_id
  ) then
    raise exception 'Supplier with ID % does not exist', p_supplier_id;
  end if;

  if p_delivery_date > current_date then
    raise exception 'Delivery date cannot be later than current date';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0 then
    raise exception 'Delivery must contain at least one item';
  end if;

  insert into public.deliveries (
    supplier_id,
    delivery_date,
    invoice_number
  )
  values (
    p_supplier_id,
    p_delivery_date,
    p_invoice_number
  )
  returning delivery_id into v_delivery_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    if not (v_item ? 'product_id')
      or not (v_item ? 'quantity')
      or not (v_item ? 'supply_price') then
      raise exception 'Each supply item must contain product_id, quantity and supply_price';
    end if;

    v_product_id := (v_item ->> 'product_id')::integer;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_supply_price := (v_item ->> 'supply_price')::numeric;

    if v_quantity <= 0 then
      raise exception 'Supply item quantity must be greater than 0';
    end if;

    if v_supply_price <= 0 then
      raise exception 'Supply price must be greater than 0';
    end if;

    perform 1
    from public.products
    where product_id = v_product_id
    for update;

    if not found then
      raise exception 'Product with ID % does not exist', v_product_id;
    end if;

    insert into public.supply_item (
      delivery_id,
      product_id,
      quantity,
      supply_price
    )
    values (
      v_delivery_id,
      v_product_id,
      v_quantity,
      v_supply_price
    );

    update public.products
    set stock_quantity = stock_quantity + v_quantity
    where product_id = v_product_id;
  end loop;

  return v_delivery_id;
end;
$$;

commit;
