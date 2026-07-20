import { createClient } from "@/lib/supabase/server";
import { createClassification, deleteClassification, updateClassification } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassificationsPage() {
  const { data: classifications } = await createClient().from("classifications").select("*").order("name");

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-white">Classifications</h1>
        <p className="text-sm text-muted mt-1">Create and manage your classification names.</p>
      </header>

      <form action={createClassification} className="card p-5 mb-8 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">Classification name</label>
          <input name="name" required placeholder="e.g. Content Writing" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" />
        </div>
        <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">Add classification</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium text-right">Actions</th></tr></thead>
          <tbody>
            {(classifications ?? []).map((classification: any) => (
              <tr key={classification.id} className="ledger-row">
                <td className="px-4 py-2.5">
                  <form id={`classification-${classification.id}`} action={updateClassification} />
                  <input form={`classification-${classification.id}`} type="hidden" name="id" value={classification.id} />
                  <input form={`classification-${classification.id}`} name="name" required defaultValue={classification.name} className="w-full bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" />
                </td>
                <td className="px-4 py-2.5"><div className="flex justify-end gap-3"><button form={`classification-${classification.id}`} type="submit" className="text-xs text-accent hover:text-white transition-colors">Save</button><form action={deleteClassification}><input type="hidden" name="id" value={classification.id} /><button type="submit" className="text-xs text-danger hover:text-white transition-colors">Delete</button></form></div></td>
              </tr>
            ))}
            {!classifications?.length && <tr><td colSpan={2} className="px-4 py-10 text-center text-muted text-sm">No classifications yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
