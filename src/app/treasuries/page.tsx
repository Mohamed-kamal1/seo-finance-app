import { createClient } from "@/lib/supabase/server";
import AddTreasuryForm from "@/components/AddTreasuryForm";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TreasuriesPage() {
  const supabase = createClient();
  const [{ data: treasuries }, { data: currencies }] = await Promise.all([
    supabase.from("v_treasury_balances").select("*").order("name"),
    supabase.from("currencies").select("code").order("code"),
  ]);

  const total = (treasuries ?? []).reduce((s: number, t: any) => s + Number(t.current_balance || 0), 0);

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Treasuries</h1>
          <p className="text-sm text-muted mt-1">{money(total)} total across {(treasuries ?? []).length} accounts</p>
        </div>
        <AddTreasuryForm currencies={currencies ?? []} />
      </header>

      <div className="grid grid-cols-3 gap-4">
        {(treasuries ?? []).map((t: any) => (
          <div key={t.treasury_account_id} className="card p-5">
            <div className="text-sm text-white">{t.name}</div>
            <div className="text-xs text-muted mt-0.5">{t.currency_code || "EGP"}</div>
            <div className="font-mono-num text-2xl mt-3 text-accent">{money(t.current_balance, t.currency_code || "EGP")}</div>
          </div>
        ))}
        {!treasuries?.length && (
          <div className="col-span-3 card p-10 text-center text-muted text-sm">No treasury accounts yet.</div>
        )}
      </div>
    </div>
  );
}
