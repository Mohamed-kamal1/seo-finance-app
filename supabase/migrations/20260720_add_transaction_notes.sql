alter table public.transactions
  add column if not exists notes text;
