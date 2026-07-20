alter table public.guest_post_sites
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists website_url text;

create index if not exists guest_post_sites_client_id_idx on public.guest_post_sites(client_id);
