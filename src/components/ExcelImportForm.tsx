"use client";

import { useEffect, useState } from "react";
import { importExcel } from "@/app/import-data/actions";

export default function ExcelImportForm() {
  const [message, setMessage] = useState<string>();
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setElapsedSeconds(0);
    const interval = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [loading]);

  async function submit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    setMessage(undefined);
    setIsError(false);
    const response = await importExcel(formData);
    setLoading(false);
    setIsError(Boolean(response.error));
    setMessage(response.error || `Import complete. ${Object.entries(response.result?.counts || {}).map(([table, count]) => `${count} ${table}`).join(", ") || "No rows were added"}.${response.result?.skipped?.length ? ` Skipped sheets: ${response.result.skipped.join(", ")}.` : ""}`);
  }

  return (
    <form action={submit} aria-busy={loading} className="card p-6 space-y-5">
      <fieldset disabled={loading} className="space-y-5 disabled:opacity-60">
        <div>
          <label className="block text-sm text-white mb-2" htmlFor="workbook">Excel workbook (.xlsx)</label>
          <input id="workbook" name="workbook" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-panel2 file:px-4 file:py-2 file:text-white" />
        </div>
        <p className="text-xs leading-5 text-muted">Supported sheet names: Clients, Client Balances, Invoices, Transactions (or Ledger), Treasuries, Guest Posts, Guest Post Ledger, Content Billing, Content Details, Currencies, Classifications, and Chart of Accounts. Use the first row for column headers.</p>
        <button className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 disabled:cursor-not-allowed">Import workbook</button>
      </fieldset>
      {message && <p role={isError ? "alert" : "status"} className={`text-sm border-t border-line pt-4 ${isError ? "text-danger" : "text-muted"}`}>{isError ? `Import failed: ${message}` : message}</p>}
      {loading && <div role="status" aria-live="assertive" className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
        <div className="w-full max-w-sm rounded-lg border border-line bg-panel p-6 text-center shadow-2xl">
          <span className="mx-auto mb-4 block h-9 w-9 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <h2 className="font-display text-lg text-white">Uploading and importing workbook</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Your file is being read and its data is loading into the database. Please keep this page open and do not submit again.</p>
          <p className="mt-3 text-xs text-accent">Working for {elapsedSeconds} second{elapsedSeconds === 1 ? "" : "s"}…</p>
        </div>
      </div>}
    </form>
  );
}
