"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

const BALANCE_FIELDS = ["seo", "guest", "hosting_domain", "content", "past_due", "discount", "total_amount", "collections", "current_due"] as const;

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

async function refreshClientBalance(supabase: SupabaseClient, clientId: string) {
  const [{ data: client, error: clientError }, { data: invoices, error: invoiceError }, { data: currencies, error: currencyError }] = await Promise.all([
    supabase.from("clients").select("currency_code").eq("id", clientId).single(),
    supabase.from("invoices").select("seo,guest,hosting_domain,content,past_due,discount,total_amount,collections,current_due,currency_code").eq("client_id", clientId),
    supabase.from("currencies").select("code,rate_to_base"),
  ]);
  if (clientError || invoiceError || currencyError || !client) return;

  const currencyCode = client.currency_code || "EGP";
  const rateByCurrency = new Map((currencies ?? []).map((currency: any) => [currency.code, Number(currency.rate_to_base) || 1]));
  const targetRate = rateByCurrency.get(currencyCode) || 1;
  const balance = Object.fromEntries(BALANCE_FIELDS.map((field) => [field, 0])) as Record<(typeof BALANCE_FIELDS)[number], number>;
  for (const invoice of invoices ?? []) {
    const conversion = (rateByCurrency.get(invoice.currency_code) || 1) / targetRate;
    for (const field of BALANCE_FIELDS) balance[field] += Number(invoice[field] || 0) * conversion;
  }

  const asOfDate = new Date().toISOString().slice(0, 10);
  const snapshot = { client_id: clientId, as_of_date: asOfDate, ...balance, currency_code: currencyCode, notes: "Automatically calculated from invoices" };
  const { data: existing } = await supabase.from("client_balances").select("id").eq("client_id", clientId).eq("as_of_date", asOfDate).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) await supabase.from("client_balances").update(snapshot).eq("id", existing.id);
  else await supabase.from("client_balances").insert(snapshot);
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
  if (payload.client_id) await refreshClientBalance(supabase, payload.client_id);
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
  if (invoice?.client_id) await refreshClientBalance(supabase, invoice.client_id);
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
  if (invoice.client_id) await refreshClientBalance(supabase, invoice.client_id);
  revalidatePath("/invoices");
  revalidatePath("/");
  if (invoice.client_id) revalidatePath(`/clients/${invoice.client_id}`);
}
