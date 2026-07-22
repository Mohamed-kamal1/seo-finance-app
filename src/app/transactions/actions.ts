"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: FormData) {
  const supabase = createClient();

  const debit = Number(formData.get("debit") || 0);
  const credit = Number(formData.get("credit") || 0);

  if (debit > 0 && credit > 0) {
    throw new Error("A transaction can have debit OR credit, not both.");
  }
  if (debit === 0 && credit === 0) {
    throw new Error("Enter a debit or credit amount.");
  }

  const payload = {
    actual_date: String(formData.get("actual_date") || new Date().toISOString().slice(0, 10)),
    cf_date: String(formData.get("cf_date") || "") || null,
    description: String(formData.get("description") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    debit,
    credit,
    classification_is: String(formData.get("classification_is") || "") || null,
    classification_cf: String(formData.get("classification_cf") || "") || null,
    treasury_account_id: String(formData.get("treasury_account_id") || "") || null,
    statement: String(formData.get("statement") || "Both"),
    source: "manual",
  };

  await supabase.from("transactions").insert(payload);
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/treasuries");
  revalidatePath("/reports");
}

export async function updateTransaction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = createClient();
  const payload = {
    actual_date: String(formData.get("actual_date") || new Date().toISOString().slice(0, 10)),
    cf_date: String(formData.get("cf_date") || "") || null,
    description: String(formData.get("description") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    debit: Number(formData.get("debit") || 0),
    credit: Number(formData.get("credit") || 0),
    classification_is: String(formData.get("classification_is") || "") || null,
    classification_cf: String(formData.get("classification_cf") || "") || null,
    treasury_account_id: String(formData.get("treasury_account_id") || "") || null,
    statement: String(formData.get("statement") || "Both"),
  };

  await supabase.from("transactions").update(payload).eq("id", id);
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/treasuries");
  revalidatePath("/reports");
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = createClient();
  await supabase.from("transactions").delete().eq("id", id);
  revalidatePath("/transactions");
  revalidatePath("/");
  revalidatePath("/treasuries");
  revalidatePath("/reports");
}
