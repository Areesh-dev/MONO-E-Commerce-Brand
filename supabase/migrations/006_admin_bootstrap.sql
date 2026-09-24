
create or replace function public.bootstrap_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set role = 'admin' where email = p_email;
end;
$$;

revoke all on function public.bootstrap_admin(text) from public, anon, authenticated;
