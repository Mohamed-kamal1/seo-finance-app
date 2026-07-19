import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/format";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: client }, { data: balances }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", params.id).single(),
    supabase.from("client_balances").select("*").eq("client_id", params.id).order("as_of_date", { ascending: false }),
    supabase.from("invoices").select("*").eq("client_id", params.id).order("invoice_date", { ascending: false }),
  ]);

  if (!client) notFound();

  const currency = client.currency_code || "EGP";

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">{client.name}</h1>
        <p className="text-sm text-muted mt-1">
          {client.website ? `${client.website} — ` : ""}
          {client.country || "No country set"}
        </p>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MiniStat label="SEO" value={money(client.seo_fee, currency)} />
        <MiniStat label="Guest post" value={money(client.guest_fee, currency)} />
        <MiniStat label="Hosting" value={money(client.hosting_fee, currency)} />
        <MiniStat label="Content" value={money(client.content_fee, currency)} />
      </div>

      <section className="mb-8">
        <h2 className="text-sm text-white mb-3">Balance history</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium text-right">Total</th>
                <th className="px-4 py-2.5 font-medium text-right">Collections</th>
                <th className="px-4 py-2.5 font-medium text-right">Current due</th>
              </tr>
            </thead>
            <tbody>
              {(balances ?? []).map((b: any) => (
                <tr key={b.id} className="ledger-row">
                  <td className="px-4 py-2.5 text-muted">{new Date(b.as_of_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num">{money(b.total_amount, currency)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-accent">{money(b.collections, currency)}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num text-danger">{money(b.current_due, currency)}</td>
                </tr>
              ))}
              {!balances?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted text-sm">
                    No balance snapshots recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm text-white mb-3">Invoices</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Service</th>
                <th className="px-4 py-2.5 font-medium text-right">Total</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(invoices ?? []).map((inv: any) => (
                <tr key={inv.id} className="ledger-row">
                  <td className="px-4 py-2.5 text-muted">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">{inv.service || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono-num">{money(inv.total_amount, inv.currency_code || currency)}</td>
                  <td className="px-4 py-2.5">
                    <StatusPill status={inv.collection_status} />
                  </td>
                </tr>
              ))}
              {!invoices?.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted text-sm">
                    No invoices recorded.
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="font-mono-num text-lg text-white mt-1">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-[rgba(62,214,166,0.12)] text-accent",
    Partial: "bg-[rgba(242,184,75,0.12)] text-accent2",
    Pending: "bg-[rgba(240,101,79,0.12)] text-danger",
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${map[status] || "bg-panel2 text-muted"}`}>{status}</span>;
}
