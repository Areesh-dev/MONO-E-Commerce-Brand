alter table public.sizes enable row level security;
alter table public.product_sizes enable row level security;

drop policy if exists sizes_public_read on public.sizes;
create policy sizes_public_read on public.sizes
  for select using (is_active = true or public.is_admin());

drop policy if exists sizes_admin_all on public.sizes;
create policy sizes_admin_all on public.sizes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_sizes_public_read on public.product_sizes;
create policy product_sizes_public_read on public.product_sizes
  for select using (true);

drop policy if exists product_sizes_admin_all on public.product_sizes;
create policy product_sizes_admin_all on public.product_sizes
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.sizes (name, slug, display_order, is_active) values
  ('XS', 'xs', 1, true),
  ('S', 's', 2, true),
  ('M', 'm', 3, true),
  ('L', 'l', 4, true),
  ('XL', 'xl', 5, true),
  ('XXL', 'xxl', 6, true),
  ('XXXL', 'xxxl', 7, true)
on conflict (slug) do nothing;