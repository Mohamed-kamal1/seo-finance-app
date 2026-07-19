"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createContentBilling(formData: FormData) {
  const supabase = createClient();

  const required_amount = Number(formData.get("required_amount") || 0);
  const paid_amount = Number(formData.get("paid_amount") || 0);

  const payload = {
    client_id: String(formData.get("client_id") || "") || null,
    client_name_raw: String(formData.get("client_name_raw") || "") || null,
    details: String(formData.get("details") || "") || null,
    required_amount,
    paid_amount,
    balance: required_amount - paid_amount,
    currency_code: String(formData.get("currency_code") || "") || null,
    period: String(formData.get("period") || "") || null,
  };

  await supabase.from("content_billing").insert(payload);
  revalidatePath("/content-billing");
}
