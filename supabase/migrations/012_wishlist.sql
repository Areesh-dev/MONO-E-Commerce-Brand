create table if not exists public.wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists wishlist_items_user_idx
  on public.wishlist_items(user_id, created_at desc);

create index if not exists wishlist_items_product_idx
  on public.wishlist_items(product_id);

alter table public.wishlist_items enable row level security;

drop policy if exists wishlist_self_all on public.wishlist_items;
create policy wishlist_self_all on public.wishlist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists wishlist_admin_read on public.wishlist_items;
create policy wishlist_admin_read on public.wishlist_items
  for select using (public.is_admin());