"use client";

import { useState } from "react";
import { updateInvoice, deleteInvoice } from "@/app/invoices/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

interface InvoiceData {
    id: string;
    client_id: string | null;
    invoice_date: string;
    service: string | null;
    seo: number;
    guest: number;
    hosting_domain: number;
    content: number;
    past_due: number;
    discount: number;
    total_amount: number;
    collections: number;
    current_due: number;
    currency_code: string | null;
    collection_status: string;
    notes: string | null;
    clients?: { name: string } | null;
}

export default function EditInvoiceForm({
    invoice,
    clients,
    currencies,
}: {
    invoice: InvoiceData;
    clients: { id: string; name: string }[];
    currencies: { code: string }[];
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateInvoice(formData);
            setOpen(false);
            addToast("Invoice updated successfully", "success");
        } catch {
            addToast("Failed to update invoice", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete invoice #${invoice.id.slice(0, 8)}? This cannot be undone.`)) return;
        try {
            const fd = new FormData();
            fd.set("id", invoice.id);
            await deleteInvoice(fd);
            addToast("Invoice deleted", "success");
        } catch {
            addToast("Failed to delete invoice", "error");
        }
    };

    return (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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

            <Modal open={open} onClose={() => setOpen(false)} title="Edit Invoice" wide>
                <form action={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input type="hidden" name="id" value={invoice.id} />

                    <div className="col-span-2">
                        <label className="block text-xs text-muted mb-1.5">Client</label>
                        <select name="client_id" defaultValue={invoice.client_id || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">Select client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Invoice date</label>
                        <input name="invoice_date" type="date" defaultValue={invoice.invoice_date?.slice(0, 10)} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Service</label>
                        <input name="service" defaultValue={invoice.service || ""} placeholder="Seo / Guest / Hosting" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Currency</label>
                        <select name="currency_code" defaultValue={invoice.currency_code || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">No currency</option>
                            {currencies.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Status</label>
                        <select name="collection_status" defaultValue={invoice.collection_status || "Pending"} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="Pending">Pending</option>
                            <option value="Partial">Partial</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">SEO</label>
                        <input name="seo" type="number" step="0.01" defaultValue={invoice.seo} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Guest post</label>
                        <input name="guest" type="number" step="0.01" defaultValue={invoice.guest} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Hosting/Domain</label>
                        <input name="hosting_domain" type="number" step="0.01" defaultValue={invoice.hosting_domain} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Content</label>
                        <input name="content" type="number" step="0.01" defaultValue={invoice.content} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Past due</label>
                        <input name="past_due" type="number" step="0.01" defaultValue={invoice.past_due} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Discount</label>
                        <input name="discount" type="number" step="0.01" defaultValue={invoice.discount} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Collections</label>
                        <input name="collections" type="number" step="0.01" defaultValue={invoice.collections} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div className="col-span-4">
                        <label className="block text-xs text-muted mb-1.5">Notes</label>
                        <textarea name="notes" rows={2} defaultValue={invoice.notes || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
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

