-- ============================================================================
-- SEO House Finance & Client Management — Supabase Schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Currencies (matches the "Summary" sheet: SAR / KWD / AED / USD / EGP ...)
-- rate_to_base = Egyptian-pound price of one unit of this currency.
-- Edit these to match your real, current rates — they're seed values only.
-- ----------------------------------------------------------------------------
create table currencies (
  code          text primary key,          -- 'SAR', 'KWD', 'AED', 'USD', 'EGP', 'KD'...
  name          text not null,
  symbol        text,
  rate_to_base  numeric(14,4) not null default 1, -- EGP per 1 unit of this currency
  is_base       boolean not null default false,
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Clients (from "Clients Balances" / "Manual Invoices" / "Clients" sheets)
-- ----------------------------------------------------------------------------
create table clients (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  website             text,
  country             text,
  payment_duration    text,         -- 'Monthly', 'Quarterly', etc.
  currency_code       text references currencies(code),
  seo_fee              numeric(14,2) default 0,
  guest_fee             numeric(14,2) default 0,
  hosting_fee            numeric(14,2) default 0,
  content_fee              numeric(14,2) default 0,
  annual_increase          numeric(14,2),         -- الزيادة السنوية
  increase_applies_date      date,                 -- تاريخ الفاتورة المطبق عليها الزيادة
  contract_date               date,                -- تاريخ التعاقد
  billing_day                  text,                -- e.g. 'يوم 15 من كل شهر'
  service_type                   text,                -- خدمات ...
  notes                           text,
  status                          text not null default 'active', -- active/paused/churned
  total_amount                    numeric(14,2) not null default 0, -- merged from invoices
  collections                     numeric(14,2) not null default 0, -- merged from invoices
  current_due                     numeric(14,2) not null default 0, -- merged from invoices
  created_at                       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Client balance snapshots (from "Clients Balances" + the monthly Jan..Aug tabs)
-- One row per client per snapshot date — lets you see history over time.
-- ----------------------------------------------------------------------------
create table client_balances (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references clients(id) on delete cascade,
  as_of_date      date not null,
  seo             numeric(14,2) default 0,
  guest           numeric(14,2) default 0,
  hosting_domain  numeric(14,2) default 0,
  content         numeric(14,2) default 0,
  past_due        numeric(14,2) default 0,
  discount        numeric(14,2) default 0,
  total_amount    numeric(14,2) default 0,
  collections     numeric(14,2) default 0,
  current_due     numeric(14,2) default 0,
  currency_code   text references currencies(code),
  notes           text,
  created_at      timestamptz not null default now()
);
create index on client_balances (client_id, as_of_date);

-- ----------------------------------------------------------------------------
-- Invoices (from "Manual Invoices" + "SEO Billing Tracker")
-- ----------------------------------------------------------------------------
create table invoices (
  id                uuid primary key default gen_random_uuid(),
  internal_id       text,
  client_id         uuid references clients(id) on delete set null,
  invoice_date      date not null,
  service           text,                 -- 'Seo', 'Hosting', 'Seo + Guest', etc.
  seo               numeric(14,2) default 0,
  guest             numeric(14,2) default 0,
  hosting_domain    numeric(14,2) default 0,
  content           numeric(14,2) default 0,
  past_due          numeric(14,2) default 0,
  discount          numeric(14,2) default 0,
  total_amount      numeric(14,2) default 0,
  collections       numeric(14,2) default 0,
  current_due       numeric(14,2) default 0,
  currency_code     text references currencies(code),
  collection_status text default 'Pending',  -- Pending / Partial / Paid
  payment_date      date,
  notes             text,
  created_at        timestamptz not null default now()
);
create index on invoices (client_id, invoice_date);

-- ----------------------------------------------------------------------------
-- Chart of accounts (from "Chart of Account")
-- ----------------------------------------------------------------------------
create table chart_of_accounts (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,          -- 'Office Rent', 'Admin Salaries', ...
  group_type  text not null,          -- 'In' | 'Out' | 'Branded' | 'Non - Branded' | 'Other Income' | 'Transfer Between Treasuries'
  unique (category, group_type)
);

-- ----------------------------------------------------------------------------
-- Classifications (simple reusable category names)
-- ----------------------------------------------------------------------------
create table classifications (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

-- ----------------------------------------------------------------------------
-- Treasury / cash accounts (from "Treasures", "Banque Misr" etc.)
-- ----------------------------------------------------------------------------
create table treasury_accounts (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique,  -- 'Vodaphone Cash/SEO', 'Cash', 'Banque Misr', ...
  currency_code     text references currencies(code),
  opening_balance   numeric(16,2) not null default 0,
  opening_date      date,
  notes             text
);

-- ----------------------------------------------------------------------------
-- General ledger transactions (from "Transactions" + bank sheets)
-- This single table drives the Income Statement and Cash Flow reports.
-- ----------------------------------------------------------------------------
create table transactions (
  id                    uuid primary key default gen_random_uuid(),
  actual_date           date not null,
  cf_date               date,
  description           text,
  notes                 text,
  debit                 numeric(16,2) default 0,   -- money in
  credit                numeric(16,2) default 0,   -- money out
  classification_is     text,   -- links loosely to chart_of_accounts.category (Income Statement bucket)
  classification_cf     text,   -- Cash Flow bucket
  treasury_account_id   uuid references treasury_accounts(id) on delete set null,
  statement             text,   -- 'Both' / 'IS' / 'CF'
  source                text default 'manual',  -- 'manual' | 'bank_import' | 'migration'
  created_at            timestamptz not null default now()
);
create index on transactions (actual_date);
create index on transactions (treasury_account_id);
create index on transactions (classification_is);

-- ----------------------------------------------------------------------------
-- Guest post site ledgers (from "Guest Post")
-- ----------------------------------------------------------------------------
create table guest_post_sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  client_id   uuid references clients(id) on delete set null,
  website_url text
);

create table guest_post_ledger (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references guest_post_sites(id) on delete cascade,
  month            date not null,          -- first of month
  beg_balance      numeric(14,2) default 0,
  credit           numeric(14,2) default 0,
  content          numeric(14,2) default 0,
  transfer         numeric(14,2) default 0,
  current_balance  numeric(14,2) default 0,
  unique (site_id, month)
);

-- ----------------------------------------------------------------------------
-- Content billing (from "Content" sheet — per-word pricing per client)
-- ----------------------------------------------------------------------------
create table content_billing (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid references clients(id) on delete set null,
  client_name_raw  text,          -- fallback if not matched to a client row
  details          text,          -- article sizes ordered
  content_detail_ids uuid[],     -- selected Content Details records
  required_amount  numeric(14,2) default 0,
  paid_amount      numeric(14,2) default 0,
  balance          numeric(14,2) default 0,
  currency_code    text references currencies(code),
  period           date,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Content details (individual content items with word count and price)
-- ----------------------------------------------------------------------------
create table content_details (
  id            uuid primary key default gen_random_uuid(),
  words         integer not null check (words > 0),
  price         numeric(14,2) not null default 0 check (price >= 0),
  currency_code text not null references currencies(code),
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- Reporting views — these power the dashboard statistics
-- ============================================================================

-- Monthly Income Statement, grouped by chart-of-accounts classification
create or replace view v_income_statement as
select
  date_trunc('month', tx.actual_date)::date as month,
  tx.classification_is as category,
  sum(tx.debit * coalesce(c.rate_to_base, 1)) as total_in,
  sum(tx.credit * coalesce(c.rate_to_base, 1)) as total_out,
  sum((tx.debit - tx.credit) * coalesce(c.rate_to_base, 1)) as net
from transactions tx
left join treasury_accounts t on t.id = tx.treasury_account_id
left join currencies c on c.code = t.currency_code
where tx.classification_is is not null
group by 1, 2
order by 1, 2;

-- Monthly Cash Flow, grouped by CF classification
create or replace view v_cash_flow as
select
  date_trunc('month', coalesce(tx.cf_date, tx.actual_date))::date as month,
  tx.classification_cf as category,
  sum(tx.debit * coalesce(c.rate_to_base, 1)) as total_in,
  sum(tx.credit * coalesce(c.rate_to_base, 1)) as total_out,
  sum((tx.debit - tx.credit) * coalesce(c.rate_to_base, 1)) as net
from transactions tx
left join treasury_accounts t on t.id = tx.treasury_account_id
left join currencies c on c.code = t.currency_code
where tx.classification_cf is not null
group by 1, 2
order by 1, 2;

-- Running balance per treasury account
create or replace view v_treasury_balances as
select
  t.id as treasury_account_id,
  t.name,
  t.currency_code,
  t.opening_balance
    + coalesce(sum(tx.debit), 0)
    - coalesce(sum(tx.credit), 0) as current_balance,
  (t.opening_balance + coalesce(sum(tx.debit), 0) - coalesce(sum(tx.credit), 0))
    * coalesce(c.rate_to_base, 1) as current_balance_base
from treasury_accounts t
left join transactions tx on tx.treasury_account_id = t.id
left join currencies c on c.code = t.currency_code
group by t.id, t.name, t.currency_code, t.opening_balance, c.rate_to_base;

-- Outstanding balance per client (latest snapshot)
create or replace view v_client_outstanding as
select distinct on (b.client_id)
  b.client_id,
  b.as_of_date,
  b.current_due,
  b.total_amount,
  b.currency_code,
  b.current_due * coalesce(c.rate_to_base, 1) as current_due_base,
  b.total_amount * coalesce(c.rate_to_base, 1) as total_amount_base
from client_balances b
left join currencies c on c.code = b.currency_code
order by b.client_id, b.as_of_date desc;

-- Company-wide monthly revenue vs expense (base currency, from transactions)
create or replace view v_monthly_summary as
select
  date_trunc('month', tx.actual_date)::date as month,
  sum(tx.debit * coalesce(c.rate_to_base, 1)) as revenue,
  sum(tx.credit * coalesce(c.rate_to_base, 1)) as expenses,
  sum((tx.debit - tx.credit) * coalesce(c.rate_to_base, 1)) as net
from transactions tx
left join treasury_accounts t on t.id = tx.treasury_account_id
left join currencies c on c.code = t.currency_code
group by 1
order by 1;

-- ============================================================================
-- Row Level Security — single admin user model.
-- Any authenticated user (i.e. you, logged in) can read/write everything.
-- Anonymous access is blocked entirely.
-- ============================================================================
alter table currencies enable row level security;
alter table clients enable row level security;
alter table client_balances enable row level security;
alter table invoices enable row level security;
alter table chart_of_accounts enable row level security;
alter table classifications enable row level security;
alter table treasury_accounts enable row level security;
alter table transactions enable row level security;
alter table guest_post_sites enable row level security;
alter table guest_post_ledger enable row level security;
alter table content_billing enable row level security;
alter table content_details enable row level security;

do $$
declare
t text;
begin
for t in
select unnest(array[
'currencies','clients','client_balances','invoices','chart_of_accounts',
'treasury_accounts','transactions','guest_post_sites','guest_post_ledger','classifications',
'content_billing','content_details'
])
loop
execute format(
'create policy "authenticated_full_access" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
t
);
end loop;
end $$;

-- ============================================================================
-- Seed currencies (rates are the values found in the workbook's Summary tab —
-- update these to current rates before relying on them)
-- ============================================================================
insert into currencies (code, name, symbol, rate_to_base, is_base) values
('EGP', 'Egyptian Pound', 'ج.م', 1, true),
('SAR', 'Saudi Riyal', 'ريال', 12.6974, false),
('KWD', 'Kuwaiti Dinar', 'د.ك', 154.6066, false),
('AED', 'UAE Dirham', 'د.إ', 12.9663, false),
('USD', 'US Dollar', '$', 47.6266, false)
on conflict (code) do nothing;
