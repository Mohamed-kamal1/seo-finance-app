import { createClient } from "@/lib/supabase/server";
import CurrenciesTable from "./CurrenciesTable";

export const dynamic = "force-dynamic";

export default async function CurrenciesPage() {
  const { data: currencies } = await createClient().from("currencies").select("*").order("code");

  return (
    <div className="p-8">
      <CurrenciesTable currencies={currencies ?? []} />
    </div>
  );
}
