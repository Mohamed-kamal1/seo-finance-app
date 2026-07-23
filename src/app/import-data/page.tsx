import { createClient } from "@/lib/supabase/server";
import ExcelImportForm from "@/components/ExcelImportForm";

export const dynamic = "force-dynamic";

export default async function ImportDataPage() {
  const supabase = createClient();

  // Fetch row counts for all relevant tables
  const tables = [
    "currencies", "clients", "invoices",
    "classifications", "treasury_accounts",
    "transactions", "guest_post_sites", "guest_post_ledger",
    "content_billing", "content_details",
  ] as const;

  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return { table, count: error ? 0 : (count ?? 0) };
    })
  );

  const totalRows = counts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="p-4 sm:p-8 page-enter">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-dim border border-accent/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl text-white">Import &amp; Export Data</h1>
            <p className="text-sm text-muted mt-0.5">
              Upload an Excel workbook to import data, or download a template to fill in manually.
            </p>
          </div>
        </div>
      </header>

      {/* Stats cards - show all available tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {counts.map(({ table, count }) => (
          <div key={table} className={`card p-3 ${count > 0 ? 'card-accent-top' : 'border border-line'}`}>
            <div className="text-xs text-muted capitalize truncate">
              {table.replace(/_/g, " ")}
            </div>
            <div className={`font-mono-num text-lg mt-1 ${count > 0 ? 'text-white' : 'text-muted'}`}>
              {count > 0 ? count.toLocaleString() : (
                <span className="text-xs text-muted">Empty</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main import/export form */}
      <ExcelImportForm totalRows={totalRows} />
    </div>
  );
}
