"use client";

import { useState, useRef } from "react";
import { createInvoice } from "@/app/invoices/actions";

export default function AddInvoiceForm({
  clients,
  currencies,
}: {
  clients: { id: string; name: string }[];
  currencies: { code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
      >
        {open ? "Cancel" : "+ Add invoice"}
      </button>

      {open && (
        <form
          ref={formRef}
          action={async (fd) => {
            await createInvoice(fd);
            formRef.current?.reset();
            setOpen(false);
          }}
          className="card p-5 mt-4 grid grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs text-muted mb-1.5">Client</label>
            <select name="client_id" required className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field name="invoice_date" label="Invoice date" type="date" />
          <Field name="service" label="Service" placeholder="Seo / Guest / Hosting" />
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
          <Field name="seo" label="SEO" type="number" />
          <Field name="guest" label="Guest post" type="number" />
          <Field name="hosting_domain" label="Hosting/Domain" type="number" />
          <Field name="content" label="Content" type="number" />
          <Field name="past_due" label="Past due" type="number" />
          <Field name="discount" label="Discount" type="number" />
          <Field name="collections" label="Collections" type="number" />
          <div>
            <label className="block text-xs text-muted mb-1.5">Status</label>
            <select name="collection_status" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option>Pending</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </div>
          <div className="col-span-4">
            <label className="block text-xs text-muted mb-1.5">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-4">
            <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
              Save invoice
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
      />
    </div>
  );
}
