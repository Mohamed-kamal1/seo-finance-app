"use client";

import { useState, useRef } from "react";
import { createClientRecord } from "@/app/clients/actions";

export default function AddClientForm({ currencies }: { currencies: { code: string }[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
      >
        {open ? "Cancel" : "+ Add client"}
      </button>

      {open && (
        <form
          ref={formRef}
          action={async (fd) => {
            await createClientRecord(fd);
            formRef.current?.reset();
            setOpen(false);
          }}
          className="card p-5 mt-4 grid grid-cols-3 gap-3"
        >
          <Field name="name" label="Client name" required />
          <Field name="website" label="Website" />
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
          <div className="col-span-3">
            <label className="block text-xs text-muted mb-1.5">Notes</label>
            <textarea name="notes" rows={2} className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
          </div>
          <div className="col-span-3">
            <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">
              Save client
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
