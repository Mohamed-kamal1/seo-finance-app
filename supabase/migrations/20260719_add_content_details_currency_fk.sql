create extension if not exists "pgcrypto";

-- Create the Content Details table when it does not yet exist.
create table if not exists public.content_details (
  id            uuid primary key default gen_random_uuid(),
  words         integer not null check (words > 0),
  price         numeric(14,2) not null default 0 check (price >= 0),
  currency_code text not null references public.currencies(code),
  created_at    timestamptz not null default now()
);

alter table public.content_details enable row level security;

drop policy if exists "content_details_authenticated_access" on public.content_details;
create policy "content_details_authenticated_access" on public.content_details
  for all
  to authenticated
  using (true)
  with check (true);

-- Make existing Content Details rows use only managed currencies going forward.
-- NOT VALID preserves pre-existing entries, while all new and updated records
-- must use a valid currencies.code value.
do $$
begin
  if to_regclass('public.content_details') is not null
     and not exists (
       select 1
       from pg_constraint
       where conname = 'content_details_currency_code_fkey'
         and conrelid = 'public.content_details'::regclass
     ) then
    alter table public.content_details
      add constraint content_details_currency_code_fkey
      foreign key (currency_code) references public.currencies(code) not valid;
  end if;
end $$;
