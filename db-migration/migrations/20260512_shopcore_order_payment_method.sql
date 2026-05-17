begin;

-- ========== Column And Constraint ==========

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'payment_method'
  ) then
    alter table public.orders
      add column payment_method varchar(30);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_orders_payment_method'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint chk_orders_payment_method
      check (
        payment_method is null
        or payment_method in ('card', 'iban', 'cash_on_delivery')
      );
  end if;
end $$;

-- ========== Function ==========

create or replace function public.pr_create_order(
  p_customer_id integer,
  p_order_date date,
  p_items jsonb,
  p_payment_method varchar default null
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

  if p_payment_method is not null
    and p_payment_method not in ('card', 'iban', 'cash_on_delivery') then
    raise exception 'Payment method must be card, iban, or cash_on_delivery';
  end if;

  insert into public.orders (
    customer_id,
    order_date,
    status,
    total_amount,
    payment_method
  )
  values (
    p_customer_id,
    p_order_date,
    'Created',
    0,
    p_payment_method
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

commit;