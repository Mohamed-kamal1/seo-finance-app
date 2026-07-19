"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createContentBilling(formData: FormData) {
  const supabase = createClient();
  const requestedPaidAmount = Number(formData.get("paid_amount") || 0);
  const contentDetailIds = formData.getAll("content_detail_ids").map(String).filter(Boolean);
  if (!contentDetailIds.length) return;

  const { data: contentDetails, error } = await supabase
    .from("content_details")
    .select("id, words, price, currency_code")
    .in("id", contentDetailIds);
  if (error || !contentDetails?.length) return;

  const currencies = new Set(contentDetails.map((item: any) => item.currency_code));
  if (currencies.size !== 1) return;

  const selectedItems = contentDetails.map((item: any) => {
    const quantity = Math.max(1, Number(formData.get(`quantity_${item.id}`) || 1));
    return { ...item, quantity };
  });
  const required_amount = selectedItems.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);
  const paid_amount = Math.min(required_amount, Math.max(0, requestedPaidAmount));
  const details = selectedItems.map((item: any) => `${item.quantity} × ${item.words} words`).join("; ");

  const payload = {
    client_id: String(formData.get("client_id") || "") || null,
    client_name_raw: null,
    details,
    content_detail_ids: selectedItems.map((item: any) => item.id),
    required_amount,
    paid_amount,
    balance: required_amount - paid_amount,
    currency_code: selectedItems[0].currency_code,
    period: String(formData.get("period") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
  };

  await supabase.from("content_billing").insert(payload);
  revalidatePath("/content-billing");
}

export async function updateContentBillingPayment(formData: FormData) {
  const id = String(formData.get("id") || "");
  const requestedPaidAmount = Number(formData.get("paid_amount") || 0);
  if (!id) return;

  const supabase = createClient();
  const { data: record } = await supabase.from("content_billing").select("required_amount").eq("id", id).single();
  if (!record) return;

  const paid_amount = Math.min(Number(record.required_amount || 0), Math.max(0, requestedPaidAmount));
  await supabase.from("content_billing").update({ paid_amount, balance: Number(record.required_amount || 0) - paid_amount }).eq("id", id);
  revalidatePath("/content-billing");
}
