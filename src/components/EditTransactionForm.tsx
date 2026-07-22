"use client";

import { useState } from "react";
import { updateTransaction, deleteTransaction } from "@/app/transactions/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

interface TransactionData {
    id: string;
    actual_date: string;
    cf_date: string | null;
    description: string | null;
    notes: string | null;
    debit: number;
    credit: number;
    classification_is: string | null;
    classification_cf: string | null;
    treasury_account_id: string | null;
    statement: string | null;
}

export default function EditTransactionForm({
    row,
    treasuries,
    classifications,
}: {
    row: TransactionData;
    treasuries: { id: string; name: string }[];
    classifications: { name: string }[];
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateTransaction(formData);
            setOpen(false);
            addToast("Transaction updated", "success");
        } catch {
            addToast("Failed to update transaction", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Delete this transaction entry? This cannot be undone.")) return;
        try {
            const fd = new FormData();
            fd.set("id", row.id);
            await deleteTransaction(fd);
            addToast("Transaction deleted", "success");
        } catch {
            addToast("Failed to delete transaction", "error");
        }
    };

    return (
        <div className="flex gap-2 justify-end">
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

            <Modal open={open} onClose={() => setOpen(false)} title="Edit Ledger Entry" wide>
                <form action={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input type="hidden" name="id" value={row.id} />

                    <div>
                        <label className="block text-xs text-muted mb-1.5">Date</label>
                        <input name="actual_date" type="date" defaultValue={row.actual_date?.slice(0, 10)} required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-muted mb-1.5">Description</label>
                        <input name="description" defaultValue={row.description || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Note</label>
                        <input name="notes" defaultValue={row.notes || ""} placeholder="Optional note" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Treasury</label>
                        <select name="treasury_account_id" defaultValue={row.treasury_account_id || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
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
                        <input name="debit" type="number" step="0.01" defaultValue={row.debit} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Credit (out)</label>
                        <input name="credit" type="number" step="0.01" defaultValue={row.credit} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">IS Classification</label>
                        <select name="classification_is" defaultValue={row.classification_is || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">Select classification</option>
                            {classifications.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">CF Classification</label>
                        <select name="classification_cf" defaultValue={row.classification_cf || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">Select classification</option>
                            {classifications.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-4 pt-2 border-t border-line">
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

