"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTreasury(formData: FormData) {
  const supabase = createClient();
  const payload = {
    name: String(formData.get("name") || ""),
    currency_code: String(formData.get("currency_code") || "") || null,
    opening_balance: Number(formData.get("opening_balance") || 0),
    opening_date: String(formData.get("opening_date") || "") || null,
  };
  if (!payload.name) return;
  await supabase.from("treasury_accounts").insert(payload);
  revalidatePath("/treasuries");
}
