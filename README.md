# SEO House — Finance & Client Ledger

A private, single-admin web app for managing clients, invoices, the transaction
ledger, treasuries, and financial reports — built to replace the two
spreadsheets (`clients.xlsx`, `Finance_2026.xlsx`) with a real database.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (Postgres + Auth)**.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com), create a new project.
2. Open the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
   This creates every table, the reporting views, row-level security, and
   seeds the currency list (SAR/KWD/AED/USD/EGP — update the rates to current
   values in the `currencies` table whenever you like).
3. In **Authentication → Users**, add yourself as a user (email + password).
   This is a single-admin app — anyone who logs in has full access, so only
   create accounts for people you trust with the finances.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in from **Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only needed for the import script — never used
  in the browser, never commit it)

## 3. Run it locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, log in with the account you created in step 1.

## 4. Import your existing spreadsheet data (optional, recommended)

The migration script reads both workbooks and loads clients, client balance
history, manual invoices, treasury accounts, chart-of-accounts categories,
and the full transaction ledger into Supabase.

```bash
cd scripts
pip install -r requirements.txt
export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Preview first — prints counts, writes nothing:
python import_data.py --clients /path/to/clients.xlsx --finance /path/to/Finance_2026.xlsx --dry-run

# Then actually import:
python import_data.py --clients /path/to/clients.xlsx --finance /path/to/Finance_2026.xlsx
```

Read the docstring at the top of `import_data.py` — a few sheets in the
original workbook are hand-built dropdown lists or ad-hoc block layouts
rather than real tables (notably `Chart of Account` and `Treasures`), so
those are approximated rather than parsed literally. After importing:
- Spot check parsed amounts and currencies (they're extracted from text
  like `"117 KWD"` with a regex, which is not bulletproof).
- Set correct **opening balances** on each treasury account under
  **Treasuries** — the import creates them at 0 since the source layout
  couldn't be parsed reliably.
- The script is safe to dry-run repeatedly, but running the real import
  twice will duplicate rows — only run it once against a fresh database,
  or clear the tables first.

## 5. Deploy

Push this folder to a GitHub repo, then import it in
[vercel.com/new](https://vercel.com/new). Add the two `NEXT_PUBLIC_*` env vars
in the Vercel project settings (skip the service role key — it's not needed
at runtime, only for the one-off import). Deploy.

## What's included

| Area | What it does |
|---|---|
| **Dashboard** | Cash on hand, outstanding receivables, monthly net, revenue/expense chart, expense mix |
| **Clients** | Client list with fees & currency, per-client balance history and invoice history |
| **Invoices** | Create invoices, track collection status (Pending/Partial/Paid) |
| **Ledger** | The general transaction ledger (debit/credit, IS & CF classification, treasury) |
| **Treasuries** | Cash/bank accounts with live running balances computed from the ledger |
| **Chart of Accounts** | Editable category list used to classify ledger entries |
| **Reports** | Income Statement and Cash Flow, generated live from the ledger by month |

## Extending it

This covers the core of both spreadsheets. Sheets not yet modeled as their
own UI (Guest Post per-site ledgers, per-word Content billing, Egyptian
e-invoice records, raw bank statement import) already have tables reserved
for them in `schema.sql` (`guest_post_sites`, `guest_post_ledger`,
`content_billing`) or can be added the same way — copy the pattern used in
`src/app/invoices` (a `page.tsx`, an `actions.ts`, and a small add-form
component) for any new record type.

## Security notes

- All tables have Row Level Security enabled; only authenticated users can
  read or write anything. There is no public/anonymous access.
- This is built for a single trusted admin (or a small trusted team, since
  everyone who logs in sees everything). If you need per-user permissions
  later, that's a schema change (add a `role` to a `profiles` table and
  scope RLS policies by role) — ask and it can be added.
# Currency rate refresh

The Currencies page has a **Refresh rates now** button that uses the logged-in user's permissions. For the automatic daily refresh on Vercel, add these environment variables in the Vercel project:

- `CRON_SECRET`: a long, randomly generated secret.
- `SUPABASE_SERVICE_ROLE_KEY`: the Supabase service-role key (server-side only; never expose it in a `NEXT_PUBLIC_` variable).

The scheduled job is configured in `vercel.json` and runs daily at 01:15 UTC.
