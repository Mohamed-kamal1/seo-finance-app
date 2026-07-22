"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function syncClientBalance(supabase: SupabaseClient, clientId: string) {
  // Calls the database function which sums invoices and updates the client row
  await supabase.rpc("sync_client_balance", { p_client_id: clientId });
}

export async function createClientRecord(formData: FormData) {
  const supabase = createClient();
  const requestedStatus = String(formData.get("status") || "active").toLowerCase();

  const payload = {
    name: String(formData.get("name") || ""),
    website: String(formData.get("website") || "") || null,
    country: String(formData.get("country") || "") || null,
    payment_duration: String(formData.get("payment_duration") || "") || null,
    currency_code: String(formData.get("currency_code") || "") || null,
    seo_fee: Number(formData.get("seo_fee") || 0),
    guest_fee: Number(formData.get("guest_fee") || 0),
    hosting_fee: Number(formData.get("hosting_fee") || 0),
    content_fee: Number(formData.get("content_fee") || 0),
    notes: String(formData.get("notes") || "") || null,
    status: requestedStatus === "paused" ? "paused" : "active",
    total_amount: 0,
    collections: 0,
    current_due: 0,
  };

  if (!payload.name) return;

  await supabase.from("clients").insert(payload);
  revalidatePath("/clients");
}

export async function updateClientStatus(clientId: string, status: string) {
  const supabase = createClient();
  await supabase.from("clients").update({ status }).eq("id", clientId);
  revalidatePath("/clients");
}

export async function updateClientRecord(clientId: string, formData: FormData) {
  const supabase = createClient();
  const optionalValue = (name: string) => String(formData.get(name) || "") || null;
  const requestedStatus = String(formData.get("status") || "active").toLowerCase();
  const optionalNumber = (name: string) => {
    const value = String(formData.get(name) || "");
    return value === "" ? null : Number(value);
  };
  const payload = {
    name: String(formData.get("name") || "").trim(),
    website: optionalValue("website"), country: optionalValue("country"),
    payment_duration: optionalValue("payment_duration"), currency_code: optionalValue("currency_code"),
    seo_fee: Number(formData.get("seo_fee") || 0), guest_fee: Number(formData.get("guest_fee") || 0),
    hosting_fee: Number(formData.get("hosting_fee") || 0), content_fee: Number(formData.get("content_fee") || 0),
    annual_increase: optionalNumber("annual_increase"), increase_applies_date: optionalValue("increase_applies_date"),
    contract_date: optionalValue("contract_date"), billing_day: optionalValue("billing_day"),
    service_type: optionalValue("service_type"), notes: optionalValue("notes"),
    status: requestedStatus === "paused" ? "paused" : "active",
  };
  if (!payload.name) return;
  await supabase.from("clients").update(payload).eq("id", clientId);
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  const supabase = createClient();

  // Check for related records before deleting
  const { count: invoiceCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId);

  if (invoiceCount && invoiceCount > 0) {
    throw new Error(
      `Cannot delete client with ${invoiceCount} invoice(s). Delete or reassign the invoices first.`
    );
  }

  const { count: contentCount } = await supabase
    .from("content_billing")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId);

  if (contentCount && contentCount > 0) {
    throw new Error(
      `Cannot delete client with ${contentCount} content billing record(s). Delete or reassign them first.`
    );
  }

  await supabase.from("clients").delete().eq("id", clientId);
  revalidatePath("/clients");
}
