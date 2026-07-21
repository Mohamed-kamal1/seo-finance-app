import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { RevenueExpenseChart, CategoryPie } from "@/components/DashboardCharts";
import { money, monthLabel } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: monthly }, { data: treasuries }, { data: outstanding }, { data: clients }, { data: isView }] =
    await Promise.all([
      supabase.from("v_monthly_summary").select("*").order("month"),
      supabase.from("v_treasury_balances").select("*"),
      supabase.from("v_client_outstanding").select("*"),
      supabase.from("clients").select("id,status"),
      supabase.from("v_income_statement").select("*"),
    ]);

  const chartData = (monthly ?? []).map((m: any) => ({
    month: monthLabel(m.month),
    revenue: Number(m.revenue) || 0,
    expenses: Number(m.expenses) || 0,
    net: Number(m.net) || 0,
  }));

  const totalTreasuryBalance = (treasuries ?? []).reduce((s: number, t: any) => s + Number(t.current_balance_base || 0), 0);
  const totalOutstanding = (outstanding ?? []).reduce((s: number, c: any) => s + Number(c.current_due_base || 0), 0);
  const activeClients = (clients ?? []).filter((c: any) => c.status?.toLowerCase() === "active").length;

  const latestMonth = chartData[chartData.length - 1];

  // Expense breakdown by classification (this month), for the pie chart
  const currentMonthKey = (monthly ?? []).length ? (monthly as any)[monthly!.length - 1].month : null;
  const expenseByCategory = (isView ?? [])
    .filter((r: any) => r.month === currentMonthKey && Number(r.total_out) > 0)
    .map((r: any) => ({ name: r.category, value: Number(r.total_out) }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="font-display text-2xl text-white">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview across all treasuries, clients, and this year's activity.</p>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total cash on hand" value={money(totalTreasuryBalance)} sub={`EGP equivalent · ${(treasuries ?? []).length} treasuries`} />
        <StatCard label="Outstanding from clients" value={money(totalOutstanding)} tone="negative" sub="EGP equivalent" />
        <StatCard label="This month's net" value={money(latestMonth?.net ?? 0)} tone={(latestMonth?.net ?? 0) >= 0 ? "positive" : "negative"} />
        <StatCard label="Active clients" value={String(activeClients)} sub={`${(clients ?? []).length} total`} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5 col-span-2">
          <div className="text-sm text-white mb-1">Revenue vs Expenses</div>
          <div className="text-xs text-muted mb-4">Monthly, from the transaction ledger</div>
          {chartData.length ? (
            <RevenueExpenseChart data={chartData} />
          ) : (
            <EmptyState note="No transactions yet — import your data or add entries in the Ledger." />
          )}
        </div>
        <div className="card p-5">
          <div className="text-sm text-white mb-1">Expense mix</div>
          <div className="text-xs text-muted mb-4">Current month, by category</div>
          {expenseByCategory.length ? (
            <CategoryPie data={expenseByCategory} />
          ) : (
            <EmptyState note="No expense data for this month." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <QuickLink href="/clients" label="Manage clients" desc="Balances, contracts, contact details" />
        <QuickLink href="/invoices" label="Track invoices" desc="Collections status, due amounts" />
        <QuickLink href="/reports" label="View reports" desc="Income statement, cash flow" />
      </div>
    </div>
  );
}

function EmptyState({ note }: { note: string }) {
  return <div className="h-[240px] flex items-center justify-center text-xs text-muted text-center px-6">{note}</div>;
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="card p-5 hover:border-accent transition-colors block">
      <div className="text-sm text-white">{label}</div>
      <div className="text-xs text-muted mt-1">{desc}</div>
    </Link>
  );
}
