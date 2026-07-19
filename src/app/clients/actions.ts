"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClientRecord(formData: FormData) {
  const supabase = createClient();

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
    status: String(formData.get("status") || "active"),
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

export async function deleteClient(clientId: string) {
  const supabase = createClient();
  await supabase.from("clients").delete().eq("id", clientId);
  revalidatePath("/clients");
}
