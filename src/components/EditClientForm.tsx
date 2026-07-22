"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient, updateClientRecord } from "@/app/clients/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

type ClientFormData = {
  id: string; name: string; website: string | null; country: string | null;
  payment_duration: string | null; currency_code: string | null;
  seo_fee: number | null; guest_fee: number | null; hosting_fee: number | null; content_fee: number | null;
  annual_increase: number | null; increase_applies_date: string | null; contract_date: string | null;
  billing_day: string | null; service_type: string | null; notes: string | null; status: string;
};

export default function EditClientForm({ client, currencies }: { client: ClientFormData; currencies: { code: string }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${client.name}? This cannot be undone.`)) return;
    try {
      await deleteClient(client.id);
      addToast("Client deleted", "success");
      router.push("/clients");
      router.refresh();
    } catch {
      addToast("Failed to delete client", "error");
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateClientRecord(client.id, formData);
      setOpen(false);
      addToast("Client updated successfully", "success");
    } catch {
      addToast("Failed to update client", "error");
    } finally {
      setLoading(false);
    }
  }

  return <div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setOpen(true)} className="border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent text-sm font-medium rounded-md px-4 py-2 flex items-center gap-2 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
        Edit client
      </button>
      <button type="button" onClick={handleDelete} className="border border-danger/30 text-danger hover:bg-[rgba(240,101,79,0.12)] hover:border-danger text-sm font-medium rounded-md px-4 py-2 flex items-center gap-2 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
        Delete client
      </button>
    </div>

    <Modal open={open} onClose={() => setOpen(false)} title={`Edit ${client.name}`} wide>
      <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Field name="name" label="Client name" defaultValue={client.name} required />
        <Field name="website" label="Website" defaultValue={client.website} />
        <Field name="country" label="Country" defaultValue={client.country} />
        <Field name="payment_duration" label="Payment duration" defaultValue={client.payment_duration} />
        <div>
          <label className="block text-xs text-muted mb-1.5">Currency</label>
          <select name="currency_code" defaultValue={client.currency_code || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            <option value="">No currency</option>
            {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Status</label>
          <select name="status" defaultValue={client.status?.toLowerCase() === "paused" ? "paused" : "active"} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
        <Field name="seo_fee" label="SEO fee" type="number" defaultValue={client.seo_fee} />
        <Field name="guest_fee" label="Guest post fee" type="number" defaultValue={client.guest_fee} />
        <Field name="hosting_fee" label="Hosting fee" type="number" defaultValue={client.hosting_fee} />
        <Field name="content_fee" label="Content fee" type="number" defaultValue={client.content_fee} />
        <Field name="annual_increase" label="Annual increase" type="number" defaultValue={client.annual_increase} />
        <Field name="increase_applies_date" label="Increase applies date" type="date" defaultValue={client.increase_applies_date} />
        <Field name="contract_date" label="Contract date" type="date" defaultValue={client.contract_date} />
        <Field name="billing_day" label="Billing day" defaultValue={client.billing_day} />
        <Field name="service_type" label="Service type" defaultValue={client.service_type} />
        <div className="md:col-span-3">
          <label className="block text-xs text-muted mb-1.5">Notes</label>
          <textarea name="notes" rows={3} defaultValue={client.notes || ""} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
        </div>
        <div className="md:col-span-3 pt-2 border-t border-line">
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
  </div>;
}

function Field({ name, label, type = "text", defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue: string | number | null; required?: boolean }) {
  return <div>
    <label className="block text-xs text-muted mb-1.5">{label}</label>
    <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} step={type === "number" ? "0.01" : undefined} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
  </div>;
}
