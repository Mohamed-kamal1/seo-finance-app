"use client";

import { useState, useRef } from "react";
import { createTreasury } from "@/app/treasuries/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

export default function AddTreasuryForm({ currencies }: { currencies: { code: string }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();

  async function handleSubmit(fd: FormData) {
    setLoading(true);
    try {
      await createTreasury(fd);
      formRef.current?.reset();
      setOpen(false);
      addToast("Treasury account created", "success");
    } catch {
      addToast("Failed to create treasury", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
      >
        + Add treasury
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Treasury Account">
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div>
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
          <div className="pt-2 border-t border-line">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 w-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />}
              {loading ? "Saving..." : "Save treasury"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
