"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGuestPostSite(formData: FormData) {
  const supabase = createClient();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await supabase.from("guest_post_sites").insert({ name });
  revalidatePath("/guest-posts");
}

export async function addLedgerEntry(formData: FormData) {
  const supabase = createClient();

  const site_id = String(formData.get("site_id") || "");
  const month = String(formData.get("month") || "");
  if (!site_id || !month) return;

  const beg_balance = Number(formData.get("beg_balance") || 0);
  const credit = Number(formData.get("credit") || 0);
  const content = Number(formData.get("content") || 0);
  const transfer = Number(formData.get("transfer") || 0);
  const current_balance = beg_balance + credit - content - transfer;

  await supabase
    .from("guest_post_ledger")
    .upsert(
      { site_id, month, beg_balance, credit, content, transfer, current_balance },
      { onConflict: "site_id,month" }
    );

  revalidatePath("/guest-posts");
}
