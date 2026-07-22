"use client";

import { useState } from "react";
import { updateGuestPostSite, deleteGuestPostSite } from "@/app/guest-posts/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

interface GuestPostSite {
    id: string;
    name: string;
    website_url: string | null;
    client_id: string | null;
}

export default function EditGuestPostSiteForm({
    site,
    clients,
}: {
    site: GuestPostSite;
    clients: { id: string; name: string; website: string | null }[];
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            await updateGuestPostSite(formData);
            setOpen(false);
            addToast("Site updated successfully", "success");
        } catch {
            addToast("Failed to update site", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${site.name}" and all its ledger entries? This cannot be undone.`)) return;
        try {
            const fd = new FormData();
            fd.set("id", site.id);
            await deleteGuestPostSite(fd);
            addToast("Site deleted", "success");
        } catch {
            addToast("Failed to delete site", "error");
        }
    };

    return (
        <div className="flex gap-2 mt-2">
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

            <Modal open={open} onClose={() => setOpen(false)} title={`Edit ${site.name}`}>
                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="id" value={site.id} />

                    <div>
                        <label className="block text-xs text-muted mb-1.5">Client</label>
                        <select name="client_id" defaultValue={site.client_id || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
                            <option value="">Select client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.website || client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Site name</label>
                        <input name="name" required defaultValue={site.name} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1.5">Website URL</label>
                        <input name="website_url" type="url" defaultValue={site.website_url || ""} placeholder="https://example.com" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
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

