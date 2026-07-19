"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient, updateClientRecord } from "@/app/clients/actions";

type ClientFormData = {
  id: string; name: string; website: string | null; country: string | null;
  payment_duration: string | null; currency_code: string | null;
  seo_fee: number | null; guest_fee: number | null; hosting_fee: number | null; content_fee: number | null;
  annual_increase: number | null; increase_applies_date: string | null; contract_date: string | null;
  billing_day: string | null; service_type: string | null; notes: string | null; status: string;
};

export default function EditClientForm({ client, currencies }: { client: ClientFormData; currencies: { code: string }[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${client.name}? This cannot be undone.`)) return;
    await deleteClient(client.id);
    router.push("/clients");
    router.refresh();
  };

  return <div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setOpen((value) => !value)} className="border border-line text-white text-sm font-medium rounded-md px-4 py-2 hover:border-accent hover:text-accent transition-colors">
        {open ? "Cancel" : "Edit client"}
      </button>
      <button type="button" onClick={handleDelete} className="border border-danger text-danger text-sm font-medium rounded-md px-4 py-2 hover:bg-[rgba(240,101,79,0.12)] transition-colors">
        Delete client
      </button>
    </div>
    {open && <form action={async (formData) => { await updateClientRecord(client.id, formData); setOpen(false); }} className="card p-5 mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
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
      <Field name="status" label="Status" defaultValue={client.status} />
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
      <div className="md:col-span-3"><button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition-opacity">Save changes</button></div>
    </form>}
  </div>;
}

function Field({ name, label, type = "text", defaultValue, required = false }: { name: string; label: string; type?: string; defaultValue: string | number | null; required?: boolean }) {
  return <div>
    <label className="block text-xs text-muted mb-1.5">{label}</label>
    <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} step={type === "number" ? "0.01" : undefined} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
  </div>;
}
