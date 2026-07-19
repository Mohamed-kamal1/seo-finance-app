"use client";

import { useState, useRef } from "react";
import { createTreasury } from "@/app/treasuries/actions";

export default function AddTreasuryForm({ currencies }: { currencies: { code: string }[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
      >
        {open ? "Cancel" : "+ Add treasury"}
      </button>
      {open && (
        <form
          ref={formRef}
          action={async (fd) => {
            await createTreasury(fd);
            formRef.current?.reset();
            setOpen(false);
          }}
          className="card p-5 mt-4 grid grid-cols-4 gap-3"
        >
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">Name</label>
            <input name="name" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Currency</label>
            <select name="currency_code" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Opening balance</label>
            <input name="opening_balance" type="number" step="0.01" defaultValue={0} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-4">
            <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
              Save treasury
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
