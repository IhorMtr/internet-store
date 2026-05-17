begin;

-- ========== Reporting Functions ==========

create or replace function public.fn_sold_products_by_date(
  p_order_date date
)
returns table (
  product_id integer,
  product_name varchar,
  total_quantity integer,
  total_amount numeric
)
language sql
stable
as $$
  select
    p.product_id,
    p.name as product_name,
    sum(oi.quantity)::integer as total_quantity,
    round(sum(oi.line_amount)::numeric, 2) as total_amount
  from public.orders as o
  inner join public.order_items as oi
    on oi.order_id = o.order_id
  inner join public.products as p
    on p.product_id = oi.product_id
  where o.order_date = p_order_date
  group by
    p.product_id,
    p.name
  order by
    sum(oi.quantity) desc,
    p.name asc;
$$;

create or replace function public.fn_top_categories_by_period(
  p_date_from date,
  p_date_to date
)
returns table (
  category_id integer,
  category_name varchar,
  total_quantity integer,
  total_amount numeric
)
language plpgsql
stable
as $$
begin
  if p_date_from > p_date_to then
    raise exception 'Date from cannot be later than date to';
  end if;

  return query
  select
    c.category_id,
    c.category_name,
    sum(oi.quantity)::integer as total_quantity,
    round(sum(oi.line_amount)::numeric, 2) as total_amount
  from public.categories as c
  inner join public.products as p
    on p.category_id = c.category_id
  inner join public.order_items as oi
    on oi.product_id = p.product_id
  inner join public.orders as o
    on o.order_id = oi.order_id
  where o.order_date between p_date_from and p_date_to
  group by
    c.category_id,
    c.category_name
  order by
    sum(oi.quantity) desc,
    sum(oi.line_amount) desc;
end;
$$;

-- ========== Shipment Function ==========

create or replace function public.pr_create_shipment(
  p_order_id integer,
  p_shipping_service varchar,
  p_tracking_number varchar,
  p_shipping_address varchar,
  p_shipping_status varchar
)
returns integer
language plpgsql
as $$
declare
  v_shipment_id integer;
begin
  if not exists (
    select 1
    from public.orders
    where order_id = p_order_id
  ) then
    raise exception 'Order with ID % does not exist', p_order_id;
  end if;

  if exists (
    select 1
    from public.shipment
    where order_id = p_order_id
  ) then
    raise exception 'Shipment for order ID % already exists', p_order_id;
  end if;

  insert into public.shipment (
    order_id,
    shipping_service,
    tracking_number,
    shipping_address,
    shipping_status
  )
  values (
    p_order_id,
    p_shipping_service,
    p_tracking_number,
    p_shipping_address,
    p_shipping_status
  )
  returning shipment_id into v_shipment_id;

  return v_shipment_id;
end;
$$;

commit;
