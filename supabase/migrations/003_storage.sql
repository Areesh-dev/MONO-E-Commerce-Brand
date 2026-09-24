insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('hero-images', 'hero-images', true),
  ('brand-images', 'brand-images', true),
  ('profile-images', 'profile-images', false)
on conflict (id) do nothing;

do $$
declare b text;
begin
  foreach b in array array['product-images','category-images','hero-images','brand-images']
  loop
    execute format($f$
      drop policy if exists %I on storage.objects;
      create policy %I on storage.objects for select using (bucket_id = %L);
    $f$, b||'_read', b||'_read', b);
  end loop;
end $$;

do $$
declare b text;
begin
  foreach b in array array['product-images','category-images','hero-images','brand-images']
  loop
    execute format($f$
      drop policy if exists %I on storage.objects;
      create policy %I on storage.objects for all
        using (bucket_id = %L and public.is_admin())
        with check (bucket_id = %L and public.is_admin());
    $f$, b||'_admin_write', b||'_admin_write', b, b);
  end loop;
end $$;

drop policy if exists profile_images_self on storage.objects;
create policy profile_images_self on storage.objects for all
  using (bucket_id = 'profile-images' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'profile-images' and auth.uid()::text = (storage.foldername(name))[1]);