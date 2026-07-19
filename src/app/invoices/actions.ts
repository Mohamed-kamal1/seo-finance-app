"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const supabase = createClient();

  const seo = Number(formData.get("seo") || 0);
  const guest = Number(formData.get("guest") || 0);
  const hosting_domain = Number(formData.get("hosting_domain") || 0);
  const content = Number(formData.get("content") || 0);
  const past_due = Number(formData.get("past_due") || 0);
  const discount = Number(formData.get("discount") || 0);
  const collections = Number(formData.get("collections") || 0);

  const total_amount = seo + guest + hosting_domain + content + past_due - discount;
  const current_due = total_amount - collections;

  const payload = {
    client_id: String(formData.get("client_id") || "") || null,
    invoice_date: String(formData.get("invoice_date") || new Date().toISOString().slice(0, 10)),
    service: String(formData.get("service") || "") || null,
    seo,
    guest,
    hosting_domain,
    content,
    past_due,
    discount,
    total_amount,
    collections,
    current_due,
    currency_code: String(formData.get("currency_code") || "") || null,
    collection_status: String(formData.get("collection_status") || "Pending"),
    notes: String(formData.get("notes") || "") || null,
  };

  await supabase.from("invoices").insert(payload);
  revalidatePath("/invoices");
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const supabase = createClient();
  await supabase
    .from("invoices")
    .update({ collection_status: status, payment_date: status === "Paid" ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", invoiceId);
  revalidatePath("/invoices");
}
