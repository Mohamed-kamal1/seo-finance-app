"use client";

import { useState, useRef } from "react";
import { createClientRecord } from "@/app/clients/actions";
import Modal from "./Modal";
import { useToast } from "./ToastProvider";

export default function AddClientForm({ currencies }: { currencies: { code: string }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();

  async function handleSubmit(fd: FormData) {
    setLoading(true);
    try {
      await createClientRecord(fd);
      formRef.current?.reset();
      setOpen(false);
      addToast("Client created successfully", "success");
    } catch {
      addToast("Failed to create client", "error");
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
        + Add client
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Client">
        <form
          ref={formRef}
          action={handleSubmit}
          className="grid grid-cols-2 gap-3"
        >
          <div className="col-span-2 sm:col-span-1">
            <Field name="name" label="Client name" required />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Field name="website" label="Website" />
          </div>
          <Field name="country" label="Country" />
          <Field name="payment_duration" label="Payment duration" placeholder="Monthly / Quarterly" />
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
            <label className="block text-xs text-muted mb-1.5">Status</label>
            <select name="status" defaultValue="active" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white">
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <Field name="seo_fee" label="SEO fee" type="number" />
          <Field name="guest_fee" label="Guest post fee" type="number" />
          <Field name="hosting_fee" label="Hosting fee" type="number" />
          <Field name="content_fee" label="Content fee" type="number" />
          <div className="col-span-2">
            <label className="block text-xs text-muted mb-1.5">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-2 pt-2 border-t border-line">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 w-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 rounded-full border-2 border-ink/30 border-t-ink animate-spin" />}
              {loading ? "Saving..." : "Save client"}
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
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
      />
    </div>
  );
}
