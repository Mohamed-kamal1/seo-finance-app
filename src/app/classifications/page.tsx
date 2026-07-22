import { createClient } from "@/lib/supabase/server";
import { createClassification, deleteClassification, updateClassification } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassificationsPage() {
  const { data: classifications } = await createClient().from("classifications").select("*").order("name");

  return (
    <div className="p-8">
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
                <td className="px-4 py-2.5"><div className="flex justify-end gap-2"><button form={`classification-${classification.id}`} type="submit" className="border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>Save</button><form action={deleteClassification}><input type="hidden" name="id" value={classification.id} /><button type="submit" className="border border-danger/30 text-danger hover:bg-[rgba(240,101,79,0.12)] hover:border-danger rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>Delete</button></form></div></td>
              </tr>
            ))}
            {!classifications?.length && <tr><td colSpan={2} className="px-4 py-10 text-center text-muted text-sm">No classifications yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
