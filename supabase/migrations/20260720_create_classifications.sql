create extension if not exists "pgcrypto";

create table if not exists public.classifications (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

alter table public.classifications enable row level security;

drop policy if exists "classifications_authenticated_access" on public.classifications;
create policy "classifications_authenticated_access"
on public.classifications
for all
to authenticated
using (true)
with check (true);
