"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { importWorkbook } from "@/lib/workbook-import";

export async function importExcel(formData: FormData) {
  const file = formData.get("workbook");
  if (!(file instanceof File) || !file.size) return { error: "Choose an Excel workbook first." };
  if (!file.name.toLowerCase().endsWith(".xlsx")) return { error: "Only .xlsx files are supported." };
  try {
    const result = await importWorkbook(createClient(), await file.arrayBuffer());
    for (const path of ["/", "/clients", "/invoices", "/transactions", "/treasuries", "/guest-posts", "/content-billing", "/content-details", "/currencies", "/classifications"]) {
      revalidatePath(path);
    }
    return { result };
  } catch (error) {
    const details =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? [
              "message" in error ? String(error.message) : "",
              "details" in error ? String(error.details) : "",
              "hint" in error ? String(error.hint) : "",
              "code" in error ? `(${String(error.code)})` : "",
            ].filter(Boolean).join(" ")
          : String(error);
    return { error: details || "The workbook could not be imported." };
  }
}
