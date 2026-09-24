
alter table public.profiles
  add constraint profiles_email_format
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table public.categories
  add constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table public.products
  add constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

alter table public.products
  add constraint products_name_len check (char_length(name) between 2 and 200),
  add constraint products_description_len check (description is null or char_length(description) <= 5000);

alter table public.reviews
  add constraint reviews_text_len check (char_length(review_text) between 10 and 2000);

alter table public.faqs
  add constraint faqs_question_len check (char_length(question) between 5 and 500),
  add constraint faqs_answer_len check (char_length(answer) between 5 and 5000);

alter table public.hero_slides
  add constraint hero_button_url_format
  check (button_url is null or button_url ~ '^(https?://|/)');

alter table public.social_links
  add constraint social_url_format check (url ~ '^https?://');

create index if not exists products_popular_feed_idx
  on public.products(created_at desc)
  where status = 'active' and is_popular = true;

create index if not exists orders_user_status_created_idx
  on public.orders(user_id, status, created_at desc);
