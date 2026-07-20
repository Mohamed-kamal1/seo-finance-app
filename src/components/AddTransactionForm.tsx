"use client";

import { useState, useRef } from "react";
import { createTransaction } from "@/app/transactions/actions";

export default function AddTransactionForm({
  treasuries,
  classifications,
}: {
  treasuries: { id: string; name: string }[];
  classifications: { name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
      >
        {open ? "Cancel" : "+ Add entry"}
      </button>

      {open && (
        <form
          ref={formRef}
          action={async (fd) => {
            await createTransaction(fd);
            formRef.current?.reset();
            setOpen(false);
          }}
          className="card p-5 mt-4 grid grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs text-muted mb-1.5">Date</label>
            <input name="actual_date" type="date" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">Description</label>
            <input name="description" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Note</label>
            <input name="notes" placeholder="Optional note" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Treasury</label>
            <select name="treasury_account_id" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="">—</option>
              {treasuries.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Debit (in)</label>
            <input name="debit" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Credit (out)</label>
            <input name="credit" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">IS Classification</label>
            <select name="classification_is" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="">Select classification</option>
              {classifications.map((classification) => <option key={classification.name} value={classification.name}>{classification.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">CF Classification</label>
            <select name="classification_cf" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="">Select classification</option>
              {classifications.map((classification) => <option key={classification.name} value={classification.name}>{classification.name}</option>)}
            </select>
          </div>
          <div className="col-span-4">
            <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
              Save entry
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
