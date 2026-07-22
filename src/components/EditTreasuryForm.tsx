"use client";

import { useState } from "react";
import { updateTreasury, deleteTreasury } from "@/app/treasuries/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

interface TreasuryData {
    treasury_account_id: string;
    name: string;
    currency_code: string | null;
    current_balance: number;
}

export default function EditTreasuryForm({
    treasury,
    currencies,
}: {
    treasury: TreasuryData;
    currencies: { code: string }[];
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateTreasury(formData);
            setOpen(false);
            addToast("Treasury updated", "success");
        } catch {
            addToast("Failed to update treasury", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete treasury "${treasury.name}"? This cannot be undone.`)) return;
        try {
            const fd = new FormData();
            fd.set("id", treasury.treasury_account_id);
            await deleteTreasury(fd);
            addToast("Treasury deleted", "success");
        } catch {
            addToast("Failed to delete treasury", "error");
        }
    };

    return (
        <div className="flex gap-2 mt-3">
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                </svg>
                Edit
            </button>
            <button
                type="button"
                onClick={handleDelete}
                className="border border-danger/30 text-danger hover:bg-[rgba(240,101,79,0.12)] hover:border-danger rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                Delete
            </button>

            <Modal open={open} onClose={() => setOpen(false)} title={`Edit ${treasury.name}`}>
                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="id" value={treasury.treasury_account_id} />
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Name</label>
                        <input name="name" required defaultValue={treasury.name} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Currency</label>
                        <select name="currency_code" defaultValue={treasury.currency_code || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">No currency</option>
                            {currencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Opening balance</label>
                        <input name="opening_balance" type="number" step="0.01" defaultValue={treasury.current_balance} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div className="pt-2 border-t border-line">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 w-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <span className="w-4 h-4 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />}
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

