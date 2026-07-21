# SEO House Finance

SEO House Finance is a private web app for running an SEO agency's client and financial operations in one place. It replaces spreadsheet-based tracking with a secure Supabase database, live balances, and automatically generated reports.

## Technology used

- **Next.js 14** — full-stack React framework using the App Router
- **TypeScript** — type-safe application code
- **Tailwind CSS** — responsive UI styling
- **Supabase** — PostgreSQL database and authentication
- **Recharts** — dashboard charts for financial trends
- **Vercel** — hosting and scheduled currency-rate refreshes

## What the app does

- **Dashboard** — shows total cash across treasuries, outstanding client balances, the latest monthly net result, active-client count, revenue-versus-expense trends, and the current expense mix.
- **Clients** — stores client details, websites, service fees, contract and billing information, status, balance history, and invoice history.
- **Invoices** — records invoices and tracks their collection status as pending, partial, or paid.
- **Guest Posts** — maintains monthly balances for guest-post websites, including credit, content usage, and transfers.
- **Content Details & Billing** — keeps content pricing by word count and tracks content orders, payments, and outstanding balances by client website.
- **Ledger** — records money in and out, dates, notes, classifications, and the treasury account involved in each transaction.
- **Treasuries** — manages cash and bank accounts and calculates their current balances from opening balances and ledger activity.
- **Currencies** — manages EGP exchange rates, with an option to refresh rates manually and through a scheduled Vercel job.
- **Chart of Accounts & Classifications** — provides reusable financial categories for consistent reporting.
- **Reports** — generates monthly Income Statement and Cash Flow tables directly from ledger data.

## How it works

The ledger is the financial source of truth. Each transaction can be assigned to a treasury account, an Income Statement category, and a Cash Flow category. The dashboard, treasury balances, and reports are calculated from this data, so there is no separate manual reconciliation step.

All application data is stored in Supabase Postgres. Access requires Supabase authentication; the app is designed for a trusted administrator or small trusted team.

## Project structure

```text
src/
  app/                 Routes, page components, server actions, and API routes
    api/cron/          Scheduled currency-refresh endpoint
    clients/           Client management and client detail pages
    invoices/          Invoice creation and collection tracking
    transactions/      General ledger
    treasuries/        Cash and bank account management
    reports/           Income Statement and Cash Flow reports
    ...                Dashboard, currencies, content, guest posts, and settings pages
  components/          Reusable forms, navigation, cards, and charts
  lib/                 Shared types, formatting helpers, currency logic, and Supabase clients
supabase/
  schema.sql           Database schema, reporting views, security policies, and seed data
  migrations/          Incremental database migrations
scripts/
  import_data.py       Optional spreadsheet-to-Supabase import utility
```

## Security

Row Level Security is enabled on the app tables. Authenticated users can access the financial data; anonymous visitors cannot. Because every signed-in user has full access, only create accounts for people you trust with the agency's financial records.

