"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAccountCategory(formData: FormData) {
  const supabase = createClient();
  const payload = {
    category: String(formData.get("category") || ""),
    group_type: String(formData.get("group_type") || ""),
  };
  if (!payload.category || !payload.group_type) return;
  await supabase.from("chart_of_accounts").insert(payload);
  revalidatePath("/chart-of-accounts");
}
