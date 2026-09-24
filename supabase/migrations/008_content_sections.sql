create table if not exists public.content_sections (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  eyebrow text,
  title text not null,
  content text,
  image_url text,
  image_position text not null default 'right'
    check (image_position in ('left','right')),
  status content_status not null default 'active',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_sections_status_idx
  on public.content_sections(status);
create index if not exists content_sections_order_idx
  on public.content_sections(display_order);

drop trigger if exists set_updated_at on public.content_sections;
create trigger set_updated_at before update on public.content_sections
for each row execute function public.set_updated_at();

alter table public.content_sections enable row level security;

drop policy if exists content_sections_public_read on public.content_sections;
create policy content_sections_public_read on public.content_sections
  for select using (status = 'active' or public.is_admin());

drop policy if exists content_sections_admin_all on public.content_sections;
create policy content_sections_admin_all on public.content_sections
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.content_sections
  (key, eyebrow, title, content, image_position, status, display_order)
values
(
  'mission',
  'Our Mission',
  E'Crafted with intention.\nWorn with confidence.',
  'We exist to make premium streetwear accessible without compromise. Every piece is sourced, cut, and stitched with the same discipline we apply to our design language — sharp lines, honest materials, and no unnecessary decoration.',
  'right',
  'active',
  1
),
(
  'vision',
  'Our Vision',
  E'A wardrobe built for\nthose who move different.',
  'We are building a brand that refuses to chase trends. Our vision is a permanent collection — pieces that stay relevant beyond seasons, defined not by logos but by silhouette, weight, and the way they sit on the body.',
  'left',
  'active',
  2
)
on conflict (key) do nothing;