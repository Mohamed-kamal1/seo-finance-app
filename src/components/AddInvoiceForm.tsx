"use client";

import { useState, useRef } from "react";
import { createInvoice } from "@/app/invoices/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

export default function AddInvoiceForm({
  clients,
  currencies,
}: {
  clients: { id: string; name: string }[];
  currencies: { code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();

  async function handleSubmit(fd: FormData) {
    setLoading(true);
    try {
      await createInvoice(fd);
      formRef.current?.reset();
      setOpen(false);
      addToast("Invoice created successfully", "success");
    } catch {
      addToast("Failed to create invoice", "error");
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
        + Add invoice
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Invoice" wide>
        <form
          ref={formRef}
          action={handleSubmit}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="col-span-2">
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
          <div className="col-span-4">
            <label className="block text-xs text-muted mb-1.5">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-4 pt-2 border-t border-line">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 w-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />}
              {loading ? "Saving..." : "Save invoice"}
            </button>
          </div>
        </form>
      </Modal>
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
