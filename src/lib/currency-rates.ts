import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type RateResponse = {
  result: string;
  rates: Record<string, number>;
};

/** Refreshes saved currencies using EGP as the source currency. */
export async function refreshCurrencyRates(forCron = false) {
  const supabase = forCron
    ? createCronClient()
    : createClient();
  const { data: currencies, error } = await supabase.from("currencies").select("code");
  if (error) throw new Error("Could not load saved currencies.");

  const response = await fetch("https://open.er-api.com/v6/latest/EGP", {
    next: { revalidate: 0 },
  });
  if (!response.ok) throw new Error("Could not fetch the latest exchange rates.");

  const data = (await response.json()) as RateResponse;
  if (data.result !== "success" || !data.rates) throw new Error("The exchange-rate service returned an invalid response.");

  const refreshedAt = new Date().toISOString();
  let updated = 0;

  for (const currency of currencies ?? []) {
    const code = currency.code.toUpperCase();
    const unitsPerEgp = data.rates[code];
    if (!unitsPerEgp || unitsPerEgp <= 0) continue;

    // The provider gives units of currency per EGP; the app stores EGP per unit.
    const { error: updateError } = await supabase
      .from("currencies")
      .update({ rate_to_base: 1 / unitsPerEgp, updated_at: refreshedAt })
      .eq("code", currency.code);
    if (!updateError) updated += 1;
  }

  return updated;
}

function createCronClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Scheduled refresh requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
