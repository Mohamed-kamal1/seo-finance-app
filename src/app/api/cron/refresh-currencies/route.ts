import { NextResponse } from "next/server";
import { refreshCurrencyRates } from "@/lib/currency-rates";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const expectedAuthorization = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authorization !== expectedAuthorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await refreshCurrencyRates(true);
    return NextResponse.json({ updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Currency refresh failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
