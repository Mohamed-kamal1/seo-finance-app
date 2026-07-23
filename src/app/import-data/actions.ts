"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { importWorkbook } from "@/lib/workbook-import";
import * as XLSX from "xlsx";

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

const TEMPLATE_SHEETS: Record<string, string[]> = {
  Currencies: ["code", "name", "symbol", "rate_to_base", "is_base", "updated_at"],
  Clients: ["name", "website", "country", "payment_duration", "currency_code", "seo_fee", "guest_fee", "hosting_fee", "content_fee", "annual_increase", "increase_applies_date", "contract_date", "billing_day", "service_type", "notes", "status", "total_amount", "collections", "current_due", "created_at"],
  Invoices: ["internal_id", "client_id", "clients_name", "invoice_date", "service", "seo", "guest", "hosting_domain", "content", "past_due", "discount", "total_amount", "collections", "current_due", "currency_code", "collection_status", "payment_date", "notes", "created_at"],
  Classifications: ["name"],
  Treasuries: ["name", "currency_code", "opening_balance", "opening_date", "notes"],
  Transactions: ["actual_date", "cf_date", "description", "notes", "debit", "credit", "classification_is", "classification_cf", "treasury_account_id", "treasury_accounts_name", "statement", "source", "created_at"],
  "Guest Posts": ["name", "client_id", "clients_name", "website_url"],
  "Guest Post Ledger": ["site_id", "guest_post_sites_name", "month", "beg_balance", "credit", "content", "transfer", "current_balance"],
  "Content Billing": ["client_id", "clients_name", "client_name_raw", "details", "content_detail_ids", "required_amount", "paid_amount", "balance", "currency_code", "period", "notes", "created_at"],
  "Content Details": ["words", "price", "currency_code", "created_at"],
};

export async function exportTemplate() {
  const workbook = XLSX.utils.book_new();
  for (const [sheetName, columns] of Object.entries(TEMPLATE_SHEETS)) {
    const ws = XLSX.utils.aoa_to_sheet([columns]);
    // Set column widths
    ws["!cols"] = columns.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  }
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  // Convert buffer to base64 for transmission
  const base64 = Buffer.from(buffer).toString("base64");
  return { base64, filename: "seo-house-import-template.xlsx" };
}

const EXPORT_TABLES: Record<string, { table: string; select: string; order: string }> = {
  currencies: { table: "currencies", select: "*", order: "code" },
  clients: { table: "clients", select: "*", order: "name" },
  invoices: { table: "invoices", select: "*, clients(name)", order: "invoice_date" },
  classifications: { table: "classifications", select: "*", order: "name" },
  treasury_accounts: { table: "treasury_accounts", select: "*", order: "name" },
  transactions: { table: "transactions", select: "*, treasury_accounts(name)", order: "actual_date" },
  guest_post_sites: { table: "guest_post_sites", select: "*, clients(name)", order: "name" },
  guest_post_ledger: { table: "guest_post_ledger", select: "*, guest_post_sites(name)", order: "month" },
  content_billing: { table: "content_billing", select: "*, clients(name)", order: "created_at" },
  content_details: { table: "content_details", select: "*", order: "words" },
};

export async function exportAllData() {
  const supabase = createClient();
  const workbook = XLSX.utils.book_new();
  const sheetMeta: { name: string; rowCount: number }[] = [];

  for (const [sheetName, config] of Object.entries(EXPORT_TABLES)) {
    const { data, error } = await supabase
      .from(config.table)
      .select(config.select)
      .order(config.order)
      .limit(10000);

    if (error) continue;

    const rows = (data ?? []).map((row: any) => {
      const flat = { ...row };
      // Flatten joined relations
      for (const key of Object.keys(flat)) {
        if (flat[key] && typeof flat[key] === "object" && !Array.isArray(flat[key]) && !(flat[key] instanceof Date)) {
          for (const subKey of Object.keys(flat[key])) {
            flat[`${key}_${subKey}`] = (flat[key] as any)[subKey];
          }
          delete flat[key];
        }
      }
      // Remove IDs for cleaner output
      delete flat.id;
      return flat;
    });

    if (rows.length > 0) {
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = Object.keys(rows[0]).map(() => ({ wch: 18 }));
      XLSX.utils.book_append_sheet(workbook, ws, sheetName.slice(0, 31)); // Excel sheet name limit
      sheetMeta.push({ name: sheetName, rowCount: rows.length });
    }
  }

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const base64 = Buffer.from(buffer).toString("base64");
  return { base64, filename: "seo-house-all-data.xlsx", sheets: sheetMeta };
}
