
alter table public.reviews
  add constraint reviews_user_profile_fk
  foreign key (user_id) references public.profiles(id) on delete cascade;

create unique index if not exists reviews_user_product_unique
  on public.reviews(user_id, product_id)
  where product_id is not null;

create index if not exists reviews_public_feed_idx
  on public.reviews(status, created_at desc)
  where status = 'approved';