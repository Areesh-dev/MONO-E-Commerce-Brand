
create or replace function public.create_order_from_cart(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_row record;
  v_count int := 0;
begin
  if p_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  for v_row in
    select ci.product_id, ci.quantity, p.price, p.stock, p.status, p.name
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.user_id = p_user_id
    for update of p
  loop
    if v_row.status <> 'active' then
      raise exception 'UNAVAILABLE:%', v_row.name;
    end if;
    if v_row.stock < v_row.quantity then
      raise exception 'INSUFFICIENT_STOCK:%', v_row.name;
    end if;
    v_total := v_total + (v_row.price * v_row.quantity);
    v_count := v_count + 1;
  end loop;

  if v_count = 0 then
    raise exception 'CART_EMPTY';
  end if;

  insert into orders (user_id, total_amount, status)
  values (p_user_id, v_total, 'pending')
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, quantity, price)
  select v_order_id, ci.product_id, p.name, ci.quantity, p.price
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.user_id = p_user_id;

  update products p
  set stock = p.stock - ci.quantity
  from cart_items ci
  where ci.user_id = p_user_id and p.id = ci.product_id;

  delete from cart_items where user_id = p_user_id;

  return v_order_id;
end;
$$;

revoke all on function public.create_order_from_cart(uuid) from public, anon, authenticated;

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_product_idx on public.order_items(product_id);