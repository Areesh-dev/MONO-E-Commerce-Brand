
alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.brands        enable row level security;
alter table public.hero_slides   enable row level security;
alter table public.why_choose_us enable row level security;
alter table public.reviews       enable row level security;
alter table public.faqs          enable row level security;
alter table public.social_links  enable row level security;
alter table public.cart_items    enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (status = 'active' or public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (status = 'active' or public.is_admin());

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read on public.brands for select using (status = 'active' or public.is_admin());

drop policy if exists hero_public_read on public.hero_slides;
create policy hero_public_read on public.hero_slides for select using (status = 'active' or public.is_admin());

drop policy if exists why_public_read on public.why_choose_us;
create policy why_public_read on public.why_choose_us for select using (status = 'active' or public.is_admin());

drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read on public.faqs for select using (status = 'active' or public.is_admin());

drop policy if exists social_public_read on public.social_links;
create policy social_public_read on public.social_links for select using (status = 'active' or public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['categories','products','brands','hero_slides','why_choose_us','faqs','social_links']
  loop
    execute format('drop policy if exists %I on public.%I', t||'_admin_all', t);
    execute format('create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())', t||'_admin_all', t);
  end loop;
end $$;

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select
  using (status = 'approved' or auth.uid() = user_id or public.is_admin());

drop policy if exists reviews_self_insert on public.reviews;
create policy reviews_self_insert on public.reviews for insert
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update on public.reviews for update using (public.is_admin());

drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews for delete using (public.is_admin());

drop policy if exists cart_self_all on public.cart_items;
create policy cart_self_all on public.cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists orders_self_read on public.orders;
create policy orders_self_read on public.orders for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists orders_self_insert on public.orders;
create policy orders_self_insert on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update using (public.is_admin());

drop policy if exists order_items_self_read on public.order_items;
create policy order_items_self_read on public.order_items for select
  using (exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

drop policy if exists order_items_self_insert on public.order_items;
create policy order_items_self_insert on public.order_items for insert
  with check (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
