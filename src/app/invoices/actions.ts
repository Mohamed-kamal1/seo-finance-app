"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { syncClientBalance } from "@/app/clients/actions";

function collectionFields(totalAmount: number, requestedCollections: number) {
  const collections = Math.min(Math.max(0, requestedCollections), Math.max(0, totalAmount));
  const current_due = totalAmount - collections;
  return {
    collections,
    current_due,
    collection_status: collections <= 0 ? "Pending" : current_due <= 0 ? "Paid" : "Partial",
    payment_date: current_due <= 0 ? new Date().toISOString().slice(0, 10) : null,
  };
}

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
  const collection = collectionFields(total_amount, collections);

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
    collections: collection.collections,
    current_due: collection.current_due,
    currency_code: String(formData.get("currency_code") || "") || null,
    collection_status: collection.collection_status,
    payment_date: collection.payment_date,
    notes: String(formData.get("notes") || "") || null,
  };

  await supabase.from("invoices").insert(payload);
  if (payload.client_id) await syncClientBalance(supabase, payload.client_id);
  revalidatePath("/invoices");
  revalidatePath("/");
  if (payload.client_id) revalidatePath(`/clients/${payload.client_id}`);
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const supabase = createClient();
  const { data: invoice } = await supabase.from("invoices").select("client_id").eq("id", invoiceId).single();
  await supabase
    .from("invoices")
    .update({ collection_status: status, payment_date: status === "Paid" ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", invoiceId);
  if (invoice?.client_id) await syncClientBalance(supabase, invoice.client_id);
  revalidatePath("/invoices");
  revalidatePath("/");
  if (invoice?.client_id) revalidatePath(`/clients/${invoice.client_id}`);
}

export async function updateInvoiceCollections(formData: FormData) {
  const invoiceId = String(formData.get("id") || "");
  const requestedCollections = Number(formData.get("collections") || 0);
  if (!invoiceId) return;

  const supabase = createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("client_id,total_amount")
    .eq("id", invoiceId)
    .single();
  if (!invoice) return;

  await supabase.from("invoices").update(collectionFields(Number(invoice.total_amount || 0), requestedCollections)).eq("id", invoiceId);
  if (invoice.client_id) await syncClientBalance(supabase, invoice.client_id);
  revalidatePath("/invoices");
  revalidatePath("/");
  if (invoice.client_id) revalidatePath(`/clients/${invoice.client_id}`);
}

export async function updateInvoice(formData: FormData) {
  const invoiceId = String(formData.get("id") || "");
  if (!invoiceId) return;

  const supabase = createClient();

  const { data: oldInvoice } = await supabase
    .from("invoices")
    .select("client_id")
    .eq("id", invoiceId)
    .single();

  const seo = Number(formData.get("seo") || 0);
  const guest = Number(formData.get("guest") || 0);
  const hosting_domain = Number(formData.get("hosting_domain") || 0);
  const content = Number(formData.get("content") || 0);
  const past_due = Number(formData.get("past_due") || 0);
  const discount = Number(formData.get("discount") || 0);
  const collections = Number(formData.get("collections") || 0);

  const total_amount = seo + guest + hosting_domain + content + past_due - discount;
  const collection = collectionFields(total_amount, collections);

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
    collections: collection.collections,
    current_due: collection.current_due,
    currency_code: String(formData.get("currency_code") || "") || null,
    collection_status: collection.collection_status,
    payment_date: collection.payment_date,
    notes: String(formData.get("notes") || "") || null,
  };

  await supabase.from("invoices").update(payload).eq("id", invoiceId);

  const newClientId = payload.client_id;
  if (oldInvoice?.client_id && oldInvoice.client_id !== newClientId) {
    await syncClientBalance(supabase, oldInvoice.client_id);
  }
  if (newClientId) await syncClientBalance(supabase, newClientId);

  revalidatePath("/invoices");
  revalidatePath("/");
  if (newClientId) revalidatePath(`/clients/${newClientId}`);
  if (oldInvoice?.client_id && oldInvoice.client_id !== newClientId) {
    revalidatePath(`/clients/${oldInvoice.client_id}`);
  }
}

export async function deleteInvoice(formData: FormData) {
  const invoiceId = String(formData.get("id") || "");
  if (!invoiceId) return;

  const supabase = createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("client_id")
    .eq("id", invoiceId)
    .single();

  await supabase.from("invoices").delete().eq("id", invoiceId);

  if (invoice?.client_id) {
    await syncClientBalance(supabase, invoice.client_id);
    revalidatePath(`/clients/${invoice.client_id}`);
  }
  revalidatePath("/invoices");
  revalidatePath("/");
}
