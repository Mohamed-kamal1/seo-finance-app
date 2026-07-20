"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGuestPostSite(formData: FormData) {
  const supabase = createClient();
  const client_id = String(formData.get("client_id") || "");
  if (!client_id) return;

  const { data: client } = await supabase.from("clients").select("name, website").eq("id", client_id).single();
  if (!client) return;

  const website_url = normaliseUrl(String(formData.get("website_url") || "").trim() || client.website || "");
  const name = client.website?.trim() || client.name;
  const { data: existing } = await supabase.from("guest_post_sites").select("id").eq("client_id", client_id).maybeSingle();
  if (existing) await supabase.from("guest_post_sites").update({ name, website_url }).eq("id", existing.id);
  else await supabase.from("guest_post_sites").insert({ name, client_id, website_url });
  revalidatePath("/guest-posts");
}

function normaliseUrl(value: string) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export async function addLedgerEntry(formData: FormData) {
  const supabase = createClient();

  let site_id = String(formData.get("site_id") || "");
  const client_id = String(formData.get("client_id") || "");
  const month = String(formData.get("month") || "");
  if (!site_id && client_id) {
    const { data: client } = await supabase.from("clients").select("name, website").eq("id", client_id).single();
    if (!client) return;

    const name = client.website?.trim() || client.name;
    const website_url = normaliseUrl(String(formData.get("website_url") || "").trim() || client.website || "");
    const { data: existing } = await supabase.from("guest_post_sites").select("id").eq("client_id", client_id).maybeSingle();
    if (existing) {
      site_id = existing.id;
      await supabase.from("guest_post_sites").update({ name, website_url }).eq("id", site_id);
    } else {
      const { data: site } = await supabase.from("guest_post_sites").insert({ name, client_id, website_url }).select("id").single();
      site_id = site?.id || "";
    }
  }
  if (!site_id || !month) return;

  const beg_balance = Number(formData.get("beg_balance") || 0);
  const credit = Number(formData.get("credit") || 0);
  const content = Number(formData.get("content") || 0);
  const transfer = Number(formData.get("transfer") || 0);
  const current_balance = beg_balance - credit - content + transfer;

  await supabase
    .from("guest_post_ledger")
    .upsert(
      { site_id, month, beg_balance, credit, content, transfer, current_balance },
      { onConflict: "site_id,month" }
    );

  revalidatePath("/guest-posts");
}

export async function updateLedgerEntry(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id") || "");
  const site_id = String(formData.get("site_id") || "");
  const month = String(formData.get("month") || "");
  if (!id || !site_id || !month) return;

  const beg_balance = Number(formData.get("beg_balance") || 0);
  const credit = Number(formData.get("credit") || 0);
  const content = Number(formData.get("content") || 0);
  const transfer = Number(formData.get("transfer") || 0);
  const current_balance = beg_balance - credit - content + transfer;

  await supabase
    .from("guest_post_ledger")
    .update({ site_id, month, beg_balance, credit, content, transfer, current_balance })
    .eq("id", id);
  revalidatePath("/guest-posts");
}

export async function deleteLedgerEntry(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  await createClient().from("guest_post_ledger").delete().eq("id", id);
  revalidatePath("/guest-posts");
}
