import { createClient } from "@/lib/supabase/server";
import { money, monthLabel } from "@/lib/format";
import { ServiceRevenueChart, ServiceRevenueLegend } from "@/components/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = createClient();
  const [{ data: isRows }, { data: cfRows }, { data: invoicesData }, { data: clientsData }] = await Promise.all([
    supabase.from("v_income_statement").select("*").order("month"),
    supabase.from("v_cash_flow").select("*").order("month"),
    supabase.from("invoices").select("*, clients(name)").order("invoice_date", { ascending: false }).limit(1000),
    supabase.from("clients").select("id,name,total_amount,collections,current_due,status").order("name"),
  ]);

  const months = Array.from(new Set((isRows ?? []).map((r: any) => r.month))).sort();
  const categories = Array.from(new Set((isRows ?? []).map((r: any) => r.category))).sort();

  function valueFor(month: string, category: string) {
    const row = (isRows ?? []).find((r: any) => r.month === month && r.category === category);
    return row ? Number(row.net) : 0;
  }

  const cfMonths = Array.from(new Set((cfRows ?? []).map((r: any) => r.month))).sort();
  const cfCategories = Array.from(new Set((cfRows ?? []).map((r: any) => r.category))).sort();

  function cfValueFor(month: string, category: string) {
    const row = (cfRows ?? []).find((r: any) => r.month === month && r.category === category);
    return row ? Number(row.net) : 0;
  }

  // ─── GROUP B: Service Revenue Mix ─────────────────────────────────
  const invoicesByMonth: Record<string, { seo: number; guest: number; hosting: number; content: number }> = {};
  for (const inv of invoicesData ?? []) {
    const monthKey = inv.invoice_date ? inv.invoice_date.slice(0, 7) : "";
    if (!monthKey) continue;
    if (!invoicesByMonth[monthKey]) invoicesByMonth[monthKey] = { seo: 0, guest: 0, hosting: 0, content: 0 };
    invoicesByMonth[monthKey].seo += Number(inv.seo || 0);
    invoicesByMonth[monthKey].guest += Number(inv.guest || 0);
    invoicesByMonth[monthKey].hosting += Number(inv.hosting_domain || 0);
    invoicesByMonth[monthKey].content += Number(inv.content || 0);
  }
  const serviceRevenueData = Object.entries(invoicesByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, vals]) => ({
      month: monthLabel(key + "-01"),
      ...vals,
    }));

  // ─── GROUP B: Accounts Receivable Aging Table ─────────────────────
  const now = new Date();
  const agingBuckets = [
    { label: "0–30 days", min: 0, max: 30, total: 0, invoices: [] as any[] },
    { label: "31–60 days", min: 31, max: 60, total: 0, invoices: [] as any[] },
    { label: "61–90 days", min: 61, max: 90, total: 0, invoices: [] as any[] },
    { label: "90+ days", min: 91, max: Infinity, total: 0, invoices: [] as any[] },
  ];
  for (const inv of invoicesData ?? []) {
    const due = Number(inv.current_due || 0);
    if (due <= 0) continue;
    const daysOverdue = Math.floor((now.getTime() - new Date(inv.invoice_date).getTime()) / (1000 * 60 * 60 * 24));
    const bucket = agingBuckets.find((b) => daysOverdue >= b.min && daysOverdue <= b.max);
    if (bucket) {
      bucket.total += due;
      bucket.invoices.push(inv);
    }
  }
  const agingTotal = agingBuckets.reduce((s, b) => s + b.total, 0);

  // ─── GROUP B: Client Profitability Summary ────────────────────────
  const clientProfitData = (clientsData ?? [])
    .filter((c: any) => c.status === "active")
    .map((c: any) => ({
      name: c.name,
      invoiced: Number(c.total_amount || 0),
      collected: Number(c.collections || 0),
      due: Number(c.current_due || 0),
      rate: Number(c.total_amount || 0) > 0 ? (Number(c.collections || 0) / Number(c.total_amount || 0)) * 100 : 0,
    }))
    .sort((a: any, b: any) => b.invoiced - a.invoiced)
    .slice(0, 20);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="font-display text-2xl text-white">Reports</h1>
        <p className="text-sm text-muted mt-1">Generated live from the transaction ledger — no manual reconciliation needed.</p>
      </header>

      <section className="mb-10">
        <h2 className="text-sm text-white mb-3">Income Statement (net by category, per month)</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium sticky left-0 bg-panel">Category</th>
                {months.map((m: any) => (
                  <th key={m} className="px-4 py-3 font-medium text-right whitespace-nowrap">
                    {monthLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat} className="ledger-row">
                  <td className="px-4 py-2.5 text-white sticky left-0 bg-panel">{cat}</td>
                  {months.map((m: any) => {
                    const v = valueFor(m, cat);
                    return (
                      <td key={m} className={`px-4 py-2.5 text-right font-mono-num whitespace-nowrap ${v >= 0 ? "text-accent" : "text-danger"}`}>
                        {money(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan={months.length + 1 || 1} className="px-4 py-10 text-center text-muted text-sm">
                    No classified transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── GROUP B: Service Revenue Mix ─────────────────────────── */}
      {serviceRevenueData.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm text-white mb-3">Service Revenue Mix (by month)</h2>
          <div className="card p-5">
            <ServiceRevenueChart data={serviceRevenueData} />
            <ServiceRevenueLegend />
          </div>
        </section>
      )}

      {/* ─── GROUP B: Accounts Receivable Aging ───────────────────── */}
      <section className="mb-10">
        <h2 className="text-sm text-white mb-3">Accounts Receivable Aging</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium">Aging Bucket</th>
                <th className="px-4 py-3 font-medium text-right">Total Due</th>
                <th className="px-4 py-3 font-medium text-right">Invoice Count</th>
                <th className="px-4 py-3 font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {agingBuckets.map((bucket) => (
                <tr key={bucket.label} className="ledger-row">
                  <td className="px-4 py-2.5 text-white">{bucket.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(bucket.total)}</td>
                  <td className="px-4 py-2.5 text-right text-muted">{bucket.invoices.length}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-line flex-1 max-w-[120px]">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${agingTotal > 0 ? (bucket.total / agingTotal) * 100 : 0}%`,
                            backgroundColor: bucket.label.includes("90") ? "#E53E3E" : bucket.label.includes("61") ? "#F0654F" : bucket.label.includes("31") ? "#F2B84B" : "#3ED6A6",
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted">{agingTotal > 0 ? ((bucket.total / agingTotal) * 100).toFixed(1) : "0"}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {agingTotal <= 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted text-sm">
                    No outstanding invoices.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-line">
                <td className="px-4 py-3 text-sm text-white font-medium">Total</td>
                <td className="px-4 py-3 text-right font-mono-num text-white font-medium">{money(agingTotal)}</td>
                <td className="px-4 py-3 text-right text-muted">{agingBuckets.reduce((s, b) => s + b.invoices.length, 0)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ─── GROUP B: Client Profitability Summary ────────────────── */}
      <section className="mb-10">
        <h2 className="text-sm text-white mb-3">Client Profitability Summary (active clients)</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium text-right">Total Invoiced</th>
                <th className="px-4 py-3 font-medium text-right">Collected</th>
                <th className="px-4 py-3 font-medium text-right">Current Due</th>
                <th className="px-4 py-3 font-medium text-right">Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {clientProfitData.map((c: any) => (
                <tr key={c.name} className="ledger-row">
                  <td className="px-4 py-2.5 text-white">{c.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num">{money(c.invoiced)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-accent">{money(c.collected)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(c.due)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.rate >= 80 ? "bg-[rgba(62,214,166,0.12)] text-accent" :
                        c.rate >= 50 ? "bg-[rgba(242,184,75,0.12)] text-accent2" :
                          "bg-[rgba(240,101,79,0.12)] text-danger"
                      }`}>
                      {c.rate.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
              {!clientProfitData.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted text-sm">
                    No active clients with invoicing data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm text-white mb-3">Cash Flow (net by category, per month)</h2>
        <div className="card overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium sticky left-0 bg-panel">Category</th>
                {cfMonths.map((m: any) => (
                  <th key={m} className="px-4 py-3 font-medium text-right whitespace-nowrap">
                    {monthLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfCategories.map((cat) => (
                <tr key={cat} className="ledger-row">
                  <td className="px-4 py-2.5 text-white sticky left-0 bg-panel">{cat}</td>
                  {cfMonths.map((m: any) => {
                    const v = cfValueFor(m, cat);
                    return (
                      <td key={m} className={`px-4 py-2.5 text-right font-mono-num whitespace-nowrap ${v >= 0 ? "text-accent" : "text-danger"}`}>
                        {money(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!cfCategories.length && (
                <tr>
                  <td colSpan={cfMonths.length + 1 || 1} className="px-4 py-10 text-center text-muted text-sm">
                    No classified transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
