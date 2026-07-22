import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import { RevenueExpenseChart, CategoryPie, ReceivablesAgingChart, ProfitMarginChart, TreasuryPie, CollectionRateChart } from "@/components/DashboardCharts";
import EmptyState from "@/components/EmptyState";
import { money, monthLabel } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: monthly }, { data: treasuries }, { data: outstanding }, { data: clients }, { data: isView }, { data: invoicesData }] =
    await Promise.all([
      supabase.from("v_monthly_summary").select("*").order("month"),
      supabase.from("v_treasury_balances").select("*"),
      supabase.from("v_client_outstanding").select("*"),
      supabase.from("clients").select("id,status"),
      supabase.from("v_income_statement").select("*"),
      supabase.from("invoices").select("invoice_date, total_amount, collections, current_due, currency_code"),
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

  const latestMonth = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  // Expense breakdown by classification (this month), for the pie chart
  const lastMonthlyEntry = (monthly ?? []).length > 0 ? (monthly as any)[(monthly ?? []).length - 1] : null;
  const currentMonthKey = lastMonthlyEntry?.month ?? null;
  const expenseByCategory = (isView ?? [])
    .filter((r: any) => r.month === currentMonthKey && Number(r.total_out) > 0)
    .map((r: any) => ({ name: r.category, value: Number(r.total_out) }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 6);

  const netTone = (latestMonth?.net ?? 0) >= 0 ? "positive" : "negative";

  // Compute trends (compare latest month to previous month)
  const prevMonth = chartData.length > 1 ? chartData[chartData.length - 2] : null;
  const netTrend = latestMonth && prevMonth
    ? ((latestMonth.net - prevMonth.net) / Math.abs(prevMonth.net || 1)) * 100
    : null;

  // ─── GROUP A: New computed data ─────────────────────────────────────────

  // 1. Receivables Aging
  const now = new Date();
  const agingBuckets = [
    { name: "0-30 days", value: 0, color: "#3ED6A6" },
    { name: "31-60 days", value: 0, color: "#F2B84B" },
    { name: "61-90 days", value: 0, color: "#F0654F" },
    { name: "90+ days", value: 0, color: "#E53E3E" },
  ];
  for (const inv of invoicesData ?? []) {
    const due = Number(inv.current_due || 0);
    if (due <= 0) continue;
    const daysOverdue = Math.floor((now.getTime() - new Date(inv.invoice_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 30) agingBuckets[0].value += due;
    else if (daysOverdue <= 60) agingBuckets[1].value += due;
    else if (daysOverdue <= 90) agingBuckets[2].value += due;
    else agingBuckets[3].value += due;
  }
  const agingData = agingBuckets.filter((b) => b.value > 0);

  // 2. Profit Margin %
  const marginData = chartData
    .filter((m: any) => m.revenue > 0)
    .map((m: any) => ({ month: m.month, margin: (m.net / m.revenue) * 100 }));

  // 3. Treasury Composition
  const treasuryPieData = (treasuries ?? []).map((t: any) => ({
    name: t.name || t.currency_code || "Unknown",
    value: Number(t.current_balance_base || 0),
  })).filter((t: any) => t.value > 0);

  // 4. Collection Rate Over Time
  const invoicesByMonth: Record<string, { total: number; collected: number }> = {};
  for (const inv of invoicesData ?? []) {
    const monthKey = inv.invoice_date.slice(0, 7);
    if (!invoicesByMonth[monthKey]) invoicesByMonth[monthKey] = { total: 0, collected: 0 };
    invoicesByMonth[monthKey].total += Number(inv.total_amount || 0);
    invoicesByMonth[monthKey].collected += Number(inv.collections || 0);
  }
  const collectionRateData = Object.entries(invoicesByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({
      month: monthLabel(key + "-01"),
      rate: vals.total > 0 ? (vals.collected / vals.total) * 100 : 0,
    }));

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8 relative">
        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-accent/30 rounded-full" />
        <div className="pl-5">
          <h1 className="font-display text-2xl text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview across all treasuries, clients, and this year&apos;s activity.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 stagger-1">
        <div className="stagger-1">
          <StatCard label="Total cash on hand" value={money(totalTreasuryBalance)} sub={`EGP equivalent · ${(treasuries ?? []).length} treasuries`}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>}
          />
        </div>
        <div className="stagger-2">
          <StatCard label="Outstanding from clients" value={money(totalOutstanding)} tone="negative" sub="EGP equivalent"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>}
          />
        </div>
        <div className="stagger-3">
          <StatCard label="This month's net" value={`${money(latestMonth?.net ?? 0)}${netTrend !== null ? ` (${netTrend >= 0 ? '+' : ''}${netTrend.toFixed(0)}%)` : ''}`} tone={netTone}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
          />
        </div>
        <div className="stagger-4">
          <StatCard label="Active clients" value={String(activeClients)} sub={`${(clients ?? []).length} total`}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 lg:col-span-2 stagger-5">
          <div className="text-sm text-white mb-1">Revenue vs Expenses</div>
          <div className="text-xs text-muted mb-4">Monthly, from the transaction ledger</div>
          {chartData.length ? (
            <RevenueExpenseChart data={chartData} />
          ) : (
            <EmptyState icon="data" title="No transaction data" description="No transactions yet — import your data or add entries in the Ledger." />
          )}
        </div>
        <div className="card p-5 stagger-6">
          <div className="text-sm text-white mb-1">Expense mix</div>
          <div className="text-xs text-muted mb-4">Current month, by category</div>
          {expenseByCategory.length ? (
            <CategoryPie data={expenseByCategory} />
          ) : (
            <EmptyState icon="money" title="No expense data" description="No expense data for this month." />
          )}
        </div>
      </div>

      {/* ─── NEW GROUP A CHARTS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="card p-5 stagger-7">
          <div className="text-sm text-white mb-1">Receivables Aging</div>
          <div className="text-xs text-muted mb-4">Outstanding invoices by overdue period</div>
          {agingData.length ? (
            <ReceivablesAgingChart data={agingData} />
          ) : (
            <EmptyState icon="data" title="No receivables" description="No outstanding invoices." />
          )}
        </div>
        <div className="card p-5 stagger-8">
          <div className="text-sm text-white mb-1">Monthly Profit Margin</div>
          <div className="text-xs text-muted mb-4">Net income as a % of revenue</div>
          {marginData.length ? (
            <ProfitMarginChart data={marginData} />
          ) : (
            <EmptyState icon="data" title="No margin data" description="Add transactions to see profit margin trends." />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="card p-5 stagger-9">
          <div className="text-sm text-white mb-1">Treasury Composition</div>
          <div className="text-xs text-muted mb-4">Cash distribution across accounts</div>
          {treasuryPieData.length ? (
            <TreasuryPie data={treasuryPieData} />
          ) : (
            <EmptyState icon="money" title="No treasury data" description="No treasury accounts with balance." />
          )}
        </div>
        <div className="card p-5 stagger-10">
          <div className="text-sm text-white mb-1">Collection Rate</div>
          <div className="text-xs text-muted mb-4">Percentage of invoiced amount collected per month</div>
          {collectionRateData.length ? (
            <CollectionRateChart data={collectionRateData} />
          ) : (
            <EmptyState icon="data" title="No invoice data" description="Add invoices to see collection rates." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink href="/clients" label="Manage clients" desc="Balances, contracts, contact details" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
        <QuickLink href="/invoices" label="Track invoices" desc="Collections status, due amounts" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>} />
        <QuickLink href="/reports" label="View reports" desc="Income statement, cash flow" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>} />
      </div>
    </div>
  );
}

function QuickLink({ href, label, desc, icon }: { href: string; label: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="card card-hover p-5 relative block group"
    >
      <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-line rounded-full group-hover:bg-accent transition-colors" />
      <div className="pl-4">
        <div className="flex items-center gap-2">
          <span className="text-muted/70 group-hover:text-accent transition-colors">{icon}</span>
          <div className="text-sm text-white group-hover:text-accent transition-colors">{label}</div>
        </div>
        <div className="text-xs text-muted mt-1 ml-[26px]">{desc}</div>
      </div>
    </Link>
  );
}