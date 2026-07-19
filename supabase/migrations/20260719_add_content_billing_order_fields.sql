-- Store the Content Details selected for each billing order and its note.
alter table public.content_billing
  add column if not exists content_detail_ids uuid[],
  add column if not exists notes text;
