import { createClient } from "@/lib/supabase/server";
import { createGuestPostSite, addLedgerEntry } from "./actions";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GuestPostsPage() {
  const supabase = createClient();
  const [{ data: sites }, { data: ledger }] = await Promise.all([
    supabase.from("guest_post_sites").select("*").order("name"),
    supabase.from("guest_post_ledger").select("*, guest_post_sites(name)").order("month", { ascending: false }).limit(200),
  ]);

  const latestBySite = new Map<string, any>();
  for (const row of ledger ?? []) {
    if (!latestBySite.has(row.site_id)) latestBySite.set(row.site_id, row);
  }

  const totalBalance = [...latestBySite.values()].reduce((s, r) => s + Number(r.current_balance || 0), 0);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Guest Post Ledgers</h1>
        <p className="text-sm text-muted mt-1">
          {(sites ?? []).length} sites — {money(totalBalance)} combined balance owed to sites
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <form action={createGuestPostSite} className="card p-5 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-muted mb-1.5">New site name</label>
            <input name="name" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
            Add site
          </button>
        </form>

        <form action={addLedgerEntry} className="card p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">Site</label>
            <select name="site_id" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="">Select site</option>
              {(sites ?? []).map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Month</label>
            <input name="month" type="date" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Beg. balance</label>
            <input name="beg_balance" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Credit</label>
            <input name="credit" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Content used</label>
            <input name="content" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">Transfer from guest</label>
            <input name="transfer" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
              Save monthly entry
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {(sites ?? []).map((s: any) => {
          const latest = latestBySite.get(s.id);
          return (
            <div key={s.id} className="card p-4">
              <div className="text-sm text-white">{s.name}</div>
              <div className="text-xs text-muted mt-0.5">
                {latest ? new Date(latest.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "No entries"}
              </div>
              <div className="font-mono-num text-lg mt-2 text-accent2">
                {latest ? money(latest.current_balance) : "—"}
              </div>
            </div>
          );
        })}
        {!sites?.length && <div className="col-span-4 card p-10 text-center text-muted text-sm">No guest post sites yet.</div>}
      </div>

      <section>
        <h2 className="text-sm text-white mb-3">Ledger history</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium text-right">Beg. balance</th>
                <th className="px-4 py-3 font-medium text-right">Credit</th>
                <th className="px-4 py-3 font-medium text-right">Content used</th>
                <th className="px-4 py-3 font-medium text-right">Current balance</th>
              </tr>
            </thead>
            <tbody>
              {(ledger ?? []).map((row: any) => (
                <tr key={row.id} className="ledger-row">
                  <td className="px-4 py-2.5 text-muted whitespace-nowrap">
                    {new Date(row.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-2.5 text-white">{row.guest_post_sites?.name || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num">{money(row.beg_balance)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-accent">{money(row.credit)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(row.content)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-accent2">{money(row.current_balance)}</td>
                </tr>
              ))}
              {!ledger?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">
                    No ledger entries yet.
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
