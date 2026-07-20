"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClassification(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await createClient().from("classifications").insert({ name });
  revalidatePath("/classifications");
}

export async function updateClassification(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;
  await createClient().from("classifications").update({ name }).eq("id", id);
  revalidatePath("/classifications");
}

export async function deleteClassification(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await createClient().from("classifications").delete().eq("id", id);
  revalidatePath("/classifications");
}
