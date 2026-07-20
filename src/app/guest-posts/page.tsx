import { createClient } from "@/lib/supabase/server";
import { addLedgerEntry, deleteLedgerEntry, updateLedgerEntry } from "./actions";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GuestPostsPage() {
  const supabase = createClient();
  const [{ data: sites }, { data: ledger }, { data: clients }] = await Promise.all([
    supabase.from("guest_post_sites").select("*").order("name"),
    supabase.from("guest_post_ledger").select("*, guest_post_sites(name, website_url)").order("month", { ascending: false }).limit(200),
    supabase.from("clients").select("id,name,website").not("website", "is", null).order("website"),
  ]);

  const latestBySite = new Map<string, any>();
  for (const row of ledger ?? []) if (!latestBySite.has(row.site_id)) latestBySite.set(row.site_id, row);
  const totalBalance = [...latestBySite.values()].reduce((sum, row) => sum + Number(row.current_balance || 0), 0);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Guest Post Ledgers</h1>
        <p className="text-sm text-muted mt-1">{(sites ?? []).length} sites - {money(totalBalance)} combined balance owed to sites</p>
      </header>

      <form action={addLedgerEntry} className="card p-5 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1.5">Client website</label>
            <select name="client_id" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="">Select client website</option>
              {(clients ?? []).map((client: any) => <option key={client.id} value={client.id}>{client.website}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Website link</label>
            <input name="website_url" type="url" placeholder="https://example.com" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div><label className="block text-xs text-muted mb-1.5">Month</label><input name="month" type="date" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1.5">Beg. balance</label><input name="beg_balance" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1.5">Credit</label><input name="credit" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1.5">Content used</label><input name="content" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
          <div><label className="block text-xs text-muted mb-1.5">Transfer from guest</label><input name="transfer" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
          <div className="sm:col-span-3"><button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">Save monthly entry</button></div>
      </form>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {(sites ?? []).map((site: any) => {
          const latest = latestBySite.get(site.id);
          return <div key={site.id} className="card p-4">
            {site.website_url ? <a href={site.website_url} target="_blank" rel="noreferrer" className="text-sm text-white hover:text-accent transition-colors">{site.name}</a> : <div className="text-sm text-white">{site.name}</div>}
            <div className="text-xs text-muted mt-0.5">{latest ? new Date(latest.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "No entries"}</div>
            <div className="font-mono-num text-lg mt-2 text-accent2">{latest ? money(latest.current_balance) : "-"}</div>
          </div>;
        })}
        {!sites?.length && <div className="col-span-4 card p-10 text-center text-muted text-sm">No guest post sites yet.</div>}
      </div>

      <section>
        <h2 className="text-sm text-white mb-3">Ledger entries</h2>
        <div className="grid grid-cols-1 gap-4">
          {(ledger ?? []).map((row: any) => (
            <details key={row.id} className="card group">
              <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between gap-4 hover:bg-[rgba(62,214,166,0.04)]">
                <div>
                  <div className="text-sm text-white">{row.guest_post_sites?.name || "Site"}</div>
                  <div className="text-xs text-muted mt-0.5">{new Date(row.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
                </div>
                <div className="text-right"><div className="text-xs text-muted">Current balance</div><div className="font-mono-num text-sm text-accent2">{money(row.current_balance)}</div></div>
              </summary>
              <form action={updateLedgerEntry} className="border-t border-line p-5">
              <input type="hidden" name="id" value={row.id} />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-muted mb-1.5">Site</label>
                  <select name="site_id" required defaultValue={row.site_id} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                    {(sites ?? []).map((site: any) => <option key={site.id} value={site.id}>{site.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-muted mb-1.5">Month</label><input name="month" type="date" required defaultValue={row.month} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Beg. balance</label><input name="beg_balance" type="number" step="0.01" defaultValue={row.beg_balance} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Credit</label><input name="credit" type="number" step="0.01" defaultValue={row.credit} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Content used</label><input name="content" type="number" step="0.01" defaultValue={row.content} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Transfer from guest</label><input name="transfer" type="number" step="0.01" defaultValue={row.transfer} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div className="card p-3"><div className="text-xs text-muted">Current balance</div><div className="font-mono-num text-lg text-accent2">{money(row.current_balance)}</div></div>
              </div>
              <div className="flex gap-4 mt-5">
                <button type="submit" className="text-xs text-accent hover:text-white transition-colors">Save changes</button>
                <button formAction={deleteLedgerEntry} type="submit" className="text-xs text-danger hover:text-white transition-colors">Delete entry</button>
              </div>
              </form>
            </details>
          ))}
          {!ledger?.length && <div className="card p-10 text-center text-muted text-sm">No ledger entries yet.</div>}
        </div>
      </section>
    </div>
  );
}
