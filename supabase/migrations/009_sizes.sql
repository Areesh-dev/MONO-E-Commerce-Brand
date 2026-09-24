create table if not exists public.sizes (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sizes_active_order_idx
  on public.sizes(display_order) where is_active = true;

drop trigger if exists set_updated_at on public.sizes;
create trigger set_updated_at before update on public.sizes
for each row execute function public.set_updated_at();

create table if not exists public.product_sizes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  size_id uuid not null references public.sizes(id) on delete cascade,
  stock int not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  unique(product_id, size_id)
);

create index if not exists product_sizes_product_idx on public.product_sizes(product_id);
create index if not exists product_sizes_size_idx on public.product_sizes(size_id);

alter table public.cart_items
  add column if not exists size_id uuid references public.sizes(id) on delete cascade;

alter table public.order_items
  add column if not exists size_id uuid references public.sizes(id) on delete set null,
  add column if not exists size_name text;

alter table public.cart_items
  drop constraint if exists cart_items_user_id_product_id_key;

drop index if exists cart_items_user_id_product_id_key;

create unique index if not exists cart_items_unique_no_size
  on public.cart_items(user_id, product_id) where size_id is null;

create unique index if not exists cart_items_unique_with_size
  on public.cart_items(user_id, product_id, size_id) where size_id is not null;

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
  if p_user_id is null then raise exception 'AUTH_REQUIRED'; end if;

  for v_row in
    select ci.id as cart_id, ci.product_id, ci.quantity, ci.size_id,
           p.price, p.stock as product_stock, p.status, p.name
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.user_id = p_user_id
    for update of p
  loop
    if v_row.status <> 'active' then
      raise exception 'UNAVAILABLE:%', v_row.name;
    end if;

    if v_row.size_id is not null then
      declare
        v_size_stock int;
        v_size_name text;
      begin
        select stock, (select name from sizes where id = v_row.size_id)
        into v_size_stock, v_size_name
        from product_sizes
        where product_id = v_row.product_id and size_id = v_row.size_id
        for update;

        if v_size_stock is null then
          raise exception 'SIZE_UNAVAILABLE:%', v_row.name;
        end if;
        if v_size_stock < v_row.quantity then
          raise exception 'INSUFFICIENT_STOCK:%:%', v_row.name, v_size_name;
        end if;

        update product_sizes set stock = stock - v_row.quantity
        where product_id = v_row.product_id and size_id = v_row.size_id;
      end;
    elsif v_row.product_stock < v_row.quantity then
      raise exception 'INSUFFICIENT_STOCK:%', v_row.name;
    end if;

    update products set stock = stock - v_row.quantity where id = v_row.product_id;

    v_total := v_total + (v_row.price * v_row.quantity);
    v_count := v_count + 1;
  end loop;

  if v_count = 0 then raise exception 'CART_EMPTY'; end if;

  insert into orders (user_id, total_amount, status)
  values (p_user_id, v_total, 'pending') returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, quantity, price, size_id, size_name)
  select v_order_id, ci.product_id, p.name, ci.quantity, p.price, ci.size_id,
         (select name from sizes where id = ci.size_id)
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.user_id = p_user_id;

  delete from cart_items where user_id = p_user_id;

  return v_order_id;
end;
$$;

revoke all on function public.create_order_from_cart(uuid) from public, anon, authenticated;