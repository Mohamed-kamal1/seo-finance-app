import { createClient } from "@/lib/supabase/server";
import AddClientForm from "@/components/AddClientForm";
import { money } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createClient();
  const [{ data: clients }, { data: currencies }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("currencies").select("code").order("code"),
  ]);

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Clients</h1>
          <p className="text-sm text-muted mt-1">{(clients ?? []).length} client accounts</p>
        </div>
        <AddClientForm currencies={currencies ?? []} />
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Billing</th>
              <th className="px-4 py-3 font-medium text-right">Monthly fees</th>
              <th className="px-4 py-3 font-medium text-right">Current due</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(clients ?? []).map((c: any) => {
              const feeTotal = (c.seo_fee || 0) + (c.guest_fee || 0) + (c.hosting_fee || 0) + (c.content_fee || 0);
              return (
                <tr key={c.id} className="ledger-row">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="text-white hover:text-accent">
                      {c.name}
                    </Link>
                    {c.website && <div className="text-xs text-muted">{c.website}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.country || "—"}</td>
                  <td className="px-4 py-3 text-muted">{c.payment_duration || "—"}</td>
                  <td className="px-4 py-3 text-right font-mono-num">
                    {money(feeTotal, c.currency_code || "EGP")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-num text-danger">
                    {c.current_due ? money(c.current_due, c.currency_code || "EGP") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${c.status?.toLowerCase() === "active"
                        ? "bg-[rgba(62,214,166,0.12)] text-accent"
                        : "bg-[rgba(240,101,79,0.12)] text-danger"
                        }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!clients?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">
                  No clients yet. Run the migration script or add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
