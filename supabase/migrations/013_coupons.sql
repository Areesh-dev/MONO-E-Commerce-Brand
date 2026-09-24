
create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  minimum_order_amount numeric(12,2) check (minimum_order_amount is null or minimum_order_amount >= 0),
  maximum_discount_amount numeric(12,2) check (maximum_discount_amount is null or maximum_discount_amount >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  usage_count int not null default 0 check (usage_count >= 0),
  per_user_limit int check (per_user_limit is null or per_user_limit > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_active_idx on public.coupons(is_active) where is_active = true;

drop trigger if exists set_updated_at on public.coupons;
create trigger set_updated_at before update on public.coupons
for each row execute function public.set_updated_at();

create or replace function public.normalize_coupon_code()
returns trigger language plpgsql as $$
begin
  new.code := upper(trim(new.code));
  return new;
end $$;

drop trigger if exists coupons_normalize_code on public.coupons;
create trigger coupons_normalize_code
before insert or update of code on public.coupons
for each row execute function public.normalize_coupon_code();

create table if not exists public.coupon_usages (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  discount_amount numeric(12,2) not null check (discount_amount >= 0),
  used_at timestamptz not null default now(),
  unique(order_id)
);

create index if not exists coupon_usages_coupon_idx on public.coupon_usages(coupon_id);
create index if not exists coupon_usages_user_idx on public.coupon_usages(user_id, coupon_id);

alter table public.orders
  add column if not exists subtotal numeric(12,2),
  add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column if not exists coupon_code text;

create or replace function public.validate_coupon(
  p_code text,
  p_subtotal numeric,
  p_user_id uuid
)
returns table (
  is_valid boolean,
  error_code text,
  coupon_id uuid,
  code text,
  description text,
  discount_type text,
  discount_value numeric,
  discount_amount numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coupon record;
  v_user_usage int;
  v_discount numeric(12,2) := 0;
  v_norm text;
begin
  v_norm := upper(trim(coalesce(p_code, '')));

  if v_norm = '' then
    return query select false, 'INVALID_CODE', null::uuid, null::text, null::text, null::text, null::numeric, 0::numeric;
    return;
  end if;

  select * into v_coupon from public.coupons where coupons.code = v_norm;

  if not found then
    return query select false, 'NOT_FOUND', null::uuid, null::text, null::text, null::text, null::numeric, 0::numeric;
    return;
  end if;

  if not v_coupon.is_active then
    return query select false, 'INACTIVE', v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, 0::numeric;
    return;
  end if;

  if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
    return query select false, 'NOT_STARTED', v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, 0::numeric;
    return;
  end if;

  if v_coupon.expires_at is not null and now() > v_coupon.expires_at then
    return query select false, 'EXPIRED', v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, 0::numeric;
    return;
  end if;

  if v_coupon.minimum_order_amount is not null and p_subtotal < v_coupon.minimum_order_amount then
    return query select false, 'MIN_ORDER', v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, 0::numeric;
    return;
  end if;

  if v_coupon.usage_limit is not null and v_coupon.usage_count >= v_coupon.usage_limit then
    return query select false, 'USAGE_LIMIT', v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, 0::numeric;
    return;
  end if;

  if v_coupon.per_user_limit is not null and p_user_id is not null then
    select count(*) into v_user_usage
    from public.coupon_usages u
    where u.coupon_id = v_coupon.id and u.user_id = p_user_id;

    if v_user_usage >= v_coupon.per_user_limit then
      return query select false, 'USER_LIMIT', v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, 0::numeric;
      return;
    end if;
  end if;

  if v_coupon.discount_type = 'percentage' then
    v_discount := p_subtotal * v_coupon.discount_value / 100;
  else
    v_discount := v_coupon.discount_value;
  end if;

  if v_coupon.maximum_discount_amount is not null and v_discount > v_coupon.maximum_discount_amount then
    v_discount := v_coupon.maximum_discount_amount;
  end if;

  if v_discount > p_subtotal then
    v_discount := p_subtotal;
  end if;

  if v_discount < 0 then v_discount := 0; end if;

  return query select true, null::text, v_coupon.id, v_coupon.code, v_coupon.description, v_coupon.discount_type, v_coupon.discount_value, v_discount;
end $$;

revoke all on function public.validate_coupon(text, numeric, uuid) from public, anon, authenticated;

drop function if exists public.create_order_from_cart(uuid);

create or replace function public.create_order_from_cart(
  p_user_id uuid,
  p_coupon_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_row record;
  v_count int := 0;
  v_coupon_norm text;
  v_coupon_id uuid;
  v_validation record;
begin
  if p_user_id is null then raise exception 'AUTH_REQUIRED'; end if;

  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    v_coupon_norm := upper(trim(p_coupon_code));
    select id into v_coupon_id from public.coupons where code = v_coupon_norm for update;
  end if;

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

    v_subtotal := v_subtotal + (v_row.price * v_row.quantity);
    v_count := v_count + 1;
  end loop;

  if v_count = 0 then raise exception 'CART_EMPTY'; end if;

  if v_coupon_id is not null then
    select * into v_validation
    from public.validate_coupon(v_coupon_norm, v_subtotal, p_user_id);

    if v_validation is null or not v_validation.is_valid then
      raise exception 'COUPON_INVALID:%', coalesce(v_validation.error_code, 'UNKNOWN');
    end if;

    v_discount := v_validation.discount_amount;
  end if;

  v_total := v_subtotal - v_discount;
  if v_total < 0 then v_total := 0; end if;

  insert into orders (user_id, subtotal, total_amount, discount_amount, coupon_code, status)
  values (
    p_user_id,
    v_subtotal,
    v_total,
    v_discount,
    case when v_coupon_id is not null then v_coupon_norm else null end,
    'pending'
  )
  returning id into v_order_id;

  insert into order_items (order_id, product_id, product_name, quantity, price, size_id, size_name)
  select v_order_id, ci.product_id, p.name, ci.quantity, p.price, ci.size_id,
         (select name from sizes where id = ci.size_id)
  from cart_items ci
  join products p on p.id = ci.product_id
  where ci.user_id = p_user_id;

  if v_coupon_id is not null then
    update coupons set usage_count = usage_count + 1 where id = v_coupon_id;

    insert into coupon_usages (coupon_id, user_id, order_id, discount_amount)
    values (v_coupon_id, p_user_id, v_order_id, v_discount);
  end if;

  delete from cart_items where user_id = p_user_id;

  return v_order_id;
end $$;

revoke all on function public.create_order_from_cart(uuid, text) from public, anon, authenticated;

alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;

drop policy if exists coupons_public_read on public.coupons;
create policy coupons_public_read on public.coupons for select using (true);

drop policy if exists coupons_admin_all on public.coupons;
create policy coupons_admin_all on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists coupon_usages_self_read on public.coupon_usages;
create policy coupon_usages_self_read on public.coupon_usages
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists coupon_usages_admin_all on public.coupon_usages;
create policy coupon_usages_admin_all on public.coupon_usages
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, per_user_limit, is_active)
values
  ('MONO10', '10% off all orders', 'percentage', 10, 0, 2000, 1000, 1, true),
  ('WELCOME500', 'PKR 500 off first order', 'fixed', 500, 3000, null, 500, 1, true)
on conflict (code) do nothing;