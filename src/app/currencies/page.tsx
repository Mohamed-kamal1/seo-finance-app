import { createClient } from "@/lib/supabase/server";
import { createCurrency, refreshCurrencies, updateCurrency } from "./actions";

export const dynamic = "force-dynamic";

export default async function CurrenciesPage() {
  const { data: currencies } = await createClient().from("currencies").select("*").order("code");

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Currencies</h1>
          <p className="text-sm text-muted mt-1">Manage the Egyptian-pound price of each currency. One unit of a currency equals the shown EGP price.</p>
        </div>
        <form action={refreshCurrencies}>
          <button type="submit" className="border border-accent text-accent hover:bg-[rgba(62,214,166,0.08)] text-sm font-medium rounded-md px-4 py-2 transition-colors whitespace-nowrap">Refresh rates now</button>
        </form>
      </header>

      <form action={createCurrency} className="card p-5 mb-8 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div><label className="block text-xs text-muted mb-1.5">Code</label><input name="code" required maxLength={8} placeholder="SAR" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white uppercase" /></div>
        <div><label className="block text-xs text-muted mb-1.5">Currency name</label><input name="name" required placeholder="Saudi Riyal" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
        <div><label className="block text-xs text-muted mb-1.5">Symbol</label><input name="symbol" placeholder="$" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
        <div><label className="block text-xs text-muted mb-1.5">Price in EGP</label><input name="rate_to_base" type="number" min="0.0001" step="0.0001" required placeholder="12.70" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
        <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">Add currency</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line"><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Symbol</th><th className="px-4 py-3 font-medium">1 unit in EGP</th><th className="px-4 py-3 font-medium">Last updated</th><th className="px-4 py-3 font-medium text-right">Action</th></tr></thead>
          <tbody>
            {(currencies ?? []).map((currency: any) => (
              <tr key={currency.code} className="ledger-row">
                <td className="px-4 py-2.5 font-mono-num text-white">{currency.code}</td>
                <td className="px-4 py-2.5"><form id={`currency-${currency.code}`} action={updateCurrency} /><input form={`currency-${currency.code}`} type="hidden" name="code" value={currency.code} /><input form={`currency-${currency.code}`} name="name" required defaultValue={currency.name} className="w-40 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" /></td>
                <td className="px-4 py-2.5"><input form={`currency-${currency.code}`} name="symbol" defaultValue={currency.symbol || ""} className="w-20 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" /></td>
                <td className="px-4 py-2.5"><input form={`currency-${currency.code}`} name="rate_to_base" type="number" min="0.0001" step="0.0001" required defaultValue={currency.rate_to_base} className="w-28 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white font-mono-num" /></td>
                <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">{currency.updated_at ? new Date(currency.updated_at).toLocaleString() : "—"}</td>
                <td className="px-4 py-2.5 text-right"><button form={`currency-${currency.code}`} type="submit" className="text-xs text-accent hover:text-white transition-colors">Save changes</button></td>
              </tr>
            ))}
            {!currencies?.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted text-sm">No currencies found. Add one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
