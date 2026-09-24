
create table if not exists public.order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_idx
  on public.order_status_history(order_id, created_at);

create index if not exists order_status_history_status_idx
  on public.order_status_history(status);

create or replace function public.log_order_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_status_history (order_id, status, note, created_at)
  values (new.id, new.status, 'Order placed', new.created_at);
  return new;
end;
$$;

drop trigger if exists on_order_created on public.orders;
create trigger on_order_created
after insert on public.orders
for each row execute function public.log_order_created();

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, note, created_by, created_at)
    values (new.id, new.status, null, auth.uid(), now());
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_status_change on public.orders;
create trigger on_order_status_change
after update of status on public.orders
for each row execute function public.log_order_status_change();

insert into public.order_status_history (order_id, status, note, created_at)
select o.id, o.status, 'Order placed', o.created_at
from public.orders o
where not exists (
  select 1 from public.order_status_history h where h.order_id = o.id
);

alter table public.order_status_history enable row level security;

drop policy if exists order_history_owner_read on public.order_status_history;
create policy order_history_owner_read on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
