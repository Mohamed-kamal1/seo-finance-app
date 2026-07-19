"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function finish(message: string, isError = false): never {
  revalidatePath("/content-details");
  redirect(`/content-details?${isError ? "error" : "success"}=${encodeURIComponent(message)}`);
}

function contentPayload(formData: FormData) {
  return {
    words: Math.max(0, Number(formData.get("words") || 0)),
    price: Math.max(0, Number(formData.get("price") || 0)),
    currency_code: String(formData.get("currency_code") || "").trim().toUpperCase(),
  };
}

export async function createContentDetail(formData: FormData) {
  const payload = contentPayload(formData);
  if (!payload.words || !payload.currency_code) return;

  const supabase = createClient();
  const { error } = await supabase.from("content_details").insert(payload);
  if (error) finish(error.message, true);
  finish("Content item created.");
}

export async function updateContentDetail(formData: FormData) {
  const id = String(formData.get("id") || "");
  const payload = contentPayload(formData);
  if (!id || !payload.words || !payload.currency_code) return;

  const supabase = createClient();
  const { error } = await supabase.from("content_details").update(payload).eq("id", id);
  if (error) finish(error.message, true);
  finish("Content item updated.");
}

export async function deleteContentDetail(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = createClient();
  const { error } = await supabase.from("content_details").delete().eq("id", id);
  if (error) finish(error.message, true);
  finish("Content item deleted.");
}
