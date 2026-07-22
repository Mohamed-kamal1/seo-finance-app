import StatCard from "@/components/StatCard";
import { createClient } from "@/lib/supabase/server";
import { createContentDetail, deleteContentDetail, updateContentDetail } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContentDetailsPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const supabase = createClient();
  const [{ data: items }, { data: currencies }] = await Promise.all([
    supabase.from("content_details").select("*").order("created_at", { ascending: false }),
    supabase.from("currencies").select("code, name").order("code"),
  ]);

  const totalWords = (items ?? []).reduce((sum: number, item: any) => sum + Number(item.words || 0), 0);

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Content Details</h1>
        <p className="text-sm text-muted mt-1">Create and manage content items with their word counts and values.</p>
      </header>

      {searchParams?.error && <div className="mb-5 rounded-md border border-danger bg-[rgba(239,86,111,0.08)] px-4 py-3 text-sm text-danger">Could not save content: {searchParams.error}</div>}
      {searchParams?.success && <div className="mb-5 rounded-md border border-accent bg-[rgba(62,214,166,0.08)] px-4 py-3 text-sm text-accent">{searchParams.success}</div>}


      <form action={createContentDetail} className="card p-5 mb-8 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-muted mb-1.5">Words</label>
          <input name="words" type="number" min="1" required placeholder="500" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Price</label>
          <input name="price" type="number" min="0" step="0.01" required placeholder="6" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Currency</label>
          <select name="currency_code" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            <option value="">Select currency</option>
            {(currencies ?? []).map((currency: any) => <option key={currency.code} value={currency.code}>{currency.code} — {currency.name}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
          Create content
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line">
              <th className="px-4 py-3 font-medium">Words</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Currency</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item: any) => (
              <tr key={item.id} className="ledger-row">
                <td className="px-4 py-2.5">
                  <form id={`update-${item.id}`} action={updateContentDetail} />
                  <input form={`update-${item.id}`} type="hidden" name="id" value={item.id} />
                  <input form={`update-${item.id}`} name="words" type="number" min="1" required defaultValue={item.words} className="w-28 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" />
                </td>
                <td className="px-4 py-2.5">
                  <input form={`update-${item.id}`} name="price" type="number" min="0" step="0.01" required defaultValue={item.price} className="w-28 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" />
                </td>
                <td className="px-4 py-2.5">
                  <select form={`update-${item.id}`} name="currency_code" required defaultValue={item.currency_code} className="w-36 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white">
                    {(currencies ?? []).map((currency: any) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-2">
                    <button form={`update-${item.id}`} type="submit" className="text-xs text-accent hover:text-white transition-colors">Save</button>
                    <form action={deleteContentDetail}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className="text-xs text-danger hover:text-white transition-colors">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!items?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted text-sm">No content items yet. Create your first one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
