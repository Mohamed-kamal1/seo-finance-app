import { createClient } from "@/lib/supabase/server";
import { createAccountCategory } from "./actions";

export const dynamic = "force-dynamic";

const GROUP_TYPES = ["In", "Out", "Branded", "Non - Branded", "Other Income", "Transfer Between Treasuries"];

export default async function ChartOfAccountsPage() {
  const supabase = createClient();
  const { data: accounts } = await supabase.from("chart_of_accounts").select("*").order("group_type").order("category");

  const grouped = GROUP_TYPES.map((g) => ({
    group: g,
    items: (accounts ?? []).filter((a: any) => a.group_type === g),
  }));

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Chart of Accounts</h1>
        <p className="text-sm text-muted mt-1">Categories used to classify ledger entries on the Income Statement.</p>
      </header>

      <form action={createAccountCategory} className="card p-5 mb-8 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">Category name</label>
          <input name="category" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <div className="w-56">
          <label className="block text-xs text-muted mb-1.5">Group</label>
          <select name="group_type" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            {GROUP_TYPES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
          Add
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4">
        {grouped.map((g) => (
          <div key={g.group} className="card p-5">
            <div className="text-sm text-white mb-3">{g.group}</div>
            <ul className="space-y-1.5">
              {g.items.map((a: any) => (
                <li key={a.id} className="text-sm text-muted flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  {a.category}
                </li>
              ))}
              {!g.items.length && <li className="text-xs text-muted">No categories yet</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
