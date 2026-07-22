import { createClient } from "@/lib/supabase/server";
import AddClientForm from "@/components/AddClientForm";
import ClientsTable from "./ClientsTable";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createClient();
  const [{ data: clients }, { data: currencies }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase.from("currencies").select("code").order("code"),
  ]);

  const data = (clients ?? []).map((c: any) => {
    const feeTotal = (c.seo_fee || 0) + (c.guest_fee || 0) + (c.hosting_fee || 0) + (c.content_fee || 0);
    return { ...c, feeTotal };
  });

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Clients</h1>
          <p className="text-sm text-muted mt-1">{data.length} client accounts</p>
        </div>
        <AddClientForm currencies={currencies ?? []} />
      </header>

      <ClientsTable data={data} />
    </div>
  );
}
