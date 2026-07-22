"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { refreshCurrencyRates } from "@/lib/currency-rates";

function currencyPayload(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    symbol: String(formData.get("symbol") || "").trim() || null,
    rate_to_base: Math.max(0, Number(formData.get("rate_to_base") || 0)),
  };
}

export async function createCurrency(formData: FormData) {
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const payload = currencyPayload(formData);
  if (!code || !payload.name || !payload.rate_to_base) return;
  await createClient().from("currencies").insert({ code, ...payload, is_base: code === "EGP" });
  revalidatePath("/currencies");
}

export async function updateCurrency(formData: FormData) {
  const code = String(formData.get("code") || "").trim();
  const payload = currencyPayload(formData);
  if (!code || !payload.name || !payload.rate_to_base) return;
  await createClient().from("currencies").update({ ...payload, updated_at: new Date().toISOString() }).eq("code", code);
  revalidatePath("/currencies");
}

export async function refreshCurrencies() {
  await refreshCurrencyRates();
  revalidatePath("/currencies");
}

export async function deleteCurrency(formData: FormData) {
  const code = String(formData.get("code") || "").trim();
  if (!code || code === "EGP") return;

  await createClient().from("currencies").delete().eq("code", code);
  revalidatePath("/currencies");
}
