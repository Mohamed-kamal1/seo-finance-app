"use client";

import { useState } from "react";
import { updateContentBilling, deleteContentBilling } from "@/app/content-billing/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

interface ContentBillingRecord {
    id: string;
    client_id: string | null;
    details: string | null;
    required_amount: number;
    paid_amount: number;
    balance: number;
    currency_code: string | null;
    period: string | null;
    notes: string | null;
    clients?: { name: string; website: string | null } | null;
    client_name_raw?: string | null;
}

export default function EditContentBillingForm({
    row,
    clients,
}: {
    row: ContentBillingRecord;
    clients: { id: string; name: string; website: string | null }[];
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateContentBilling(formData);
            setOpen(false);
            addToast("Content billing updated", "success");
        } catch {
            addToast("Failed to update", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Delete this content billing record? This cannot be undone.")) return;
        try {
            const fd = new FormData();
            fd.set("id", row.id);
            await deleteContentBilling(fd);
            addToast("Record deleted", "success");
        } catch {
            addToast("Failed to delete", "error");
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

            <Modal open={open} onClose={() => setOpen(false)} title="Edit Content Billing" wide>
                <form action={handleSubmit} className="grid grid-cols-2 gap-3">
                    <input type="hidden" name="id" value={row.id} />

                    <div className="col-span-2">
                        <label className="block text-xs text-muted mb-1.5">Website / Client</label>
                        <select name="client_id" defaultValue={row.client_id || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">Select client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.website || c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Period</label>
                        <input name="period" type="date" defaultValue={row.period || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Currency</label>
                        <input name="currency_code" defaultValue={row.currency_code || "EGP"} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Details</label>
                        <input name="details" defaultValue={row.details || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Required amount</label>
                        <input name="required_amount" type="number" min="0" step="0.01" defaultValue={row.required_amount} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Paid amount</label>
                        <input name="paid_amount" type="number" min="0" step="0.01" defaultValue={row.paid_amount} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-muted mb-1.5">Notes</label>
                        <textarea name="notes" rows={2} defaultValue={row.notes || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div className="col-span-2 pt-2 border-t border-line">
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

