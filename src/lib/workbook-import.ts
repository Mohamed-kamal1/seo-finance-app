import * as XLSX from "xlsx";
import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
  return String(error);
}

const SHEET_TABLES: Record<string, string> = {
  currencies: "currencies", clients: "clients", "client balances": "client_balances",
  balances: "client_balances", invoices: "invoices", "manual invoices": "invoices",
  "chart of accounts": "chart_of_accounts", classifications: "classifications",
  treasuries: "treasury_accounts", "treasury accounts": "treasury_accounts",
  transactions: "transactions", ledger: "transactions", "guest posts": "guest_post_sites",
  "guest post sites": "guest_post_sites", "guest post ledger": "guest_post_ledger",
  "content billing": "content_billing", "content details": "content_details",
};

const COLUMNS: Record<string, Set<string>> = {
  currencies: new Set(["code", "name", "symbol", "rate_to_base", "is_base"]),
  clients: new Set(["name", "website", "country", "payment_duration", "currency_code", "seo_fee", "guest_fee", "hosting_fee", "content_fee", "annual_increase", "increase_applies_date", "contract_date", "billing_day", "service_type", "notes", "status"]),
  client_balances: new Set(["client_id", "as_of_date", "seo", "guest", "hosting_domain", "content", "past_due", "discount", "total_amount", "collections", "current_due", "currency_code", "notes"]),
  invoices: new Set(["internal_id", "client_id", "invoice_date", "service", "seo", "guest", "hosting_domain", "content", "past_due", "discount", "total_amount", "collections", "current_due", "currency_code", "collection_status", "payment_date", "notes"]),
  chart_of_accounts: new Set(["category", "group_type"]), classifications: new Set(["name"]),
  treasury_accounts: new Set(["name", "currency_code", "opening_balance", "opening_date", "notes"]),
  transactions: new Set(["actual_date", "cf_date", "description", "notes", "debit", "credit", "classification_is", "classification_cf", "treasury_account_id", "statement", "source"]),
  guest_post_sites: new Set(["name", "client_id", "website_url"]),
  guest_post_ledger: new Set(["site_id", "month", "beg_balance", "credit", "content", "transfer", "current_balance"]),
  content_billing: new Set(["client_id", "client_name_raw", "details", "required_amount", "paid_amount", "balance", "currency_code", "period", "notes"]),
  content_details: new Set(["words", "price", "currency_code"]),
};

const ALIASES: Record<string, string> = {
  "client": "client_name", "client name": "client_name", "treasury": "treasury_name", "treasury name": "treasury_name", "site": "site_name", "site name": "site_name",
  "website url": "website_url", "hosting domain": "hosting_domain", "actual date": "actual_date", "cf date": "cf_date", "invoice date": "invoice_date", "payment date": "payment_date", "as of date": "as_of_date", "opening date": "opening_date", "required amount": "required_amount", "paid amount": "paid_amount", "current due": "current_due", "total amount": "total_amount", "collection status": "collection_status", "currency": "currency_code", "currency code": "currency_code", "group type": "group_type", "beg balance": "beg_balance", "current balance": "current_balance", "classifications is": "classification_is", "classifications cf": "classification_cf",
};

const NUMBERS = new Set(["rate_to_base", "seo_fee", "guest_fee", "hosting_fee", "content_fee", "annual_increase", "seo", "guest", "hosting_domain", "content", "past_due", "discount", "total_amount", "collections", "current_due", "opening_balance", "debit", "credit", "beg_balance", "transfer", "current_balance", "required_amount", "paid_amount", "balance", "price", "words"]);
const DATES = new Set(["increase_applies_date", "contract_date", "as_of_date", "invoice_date", "payment_date", "opening_date", "actual_date", "cf_date", "month", "period"]);

function normalise(value: unknown) { return String(value).trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " "); }
function columnName(value: unknown) { const label = normalise(value); return ALIASES[label] || label.replace(/ /g, "_"); }
function dateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : value;
  }
  return value;
}
function numberValue(value: unknown) {
  if (typeof value === "number") return value;
  const match = String(value).match(/[-+]?\d[\d,.]*/);
  return match ? Number(match[0].replace(/,/g, "")) : null;
}
function cleanRow(table: string, raw: Row): Row {
  const row: Row = {};
  for (const [header, original] of Object.entries(raw)) {
    const column = columnName(header);
    if (!COLUMNS[table].has(column) && !["client_name", "treasury_name", "site_name"].includes(column)) continue;
    if (original === null || original === undefined || original === "") continue;
    row[column] = NUMBERS.has(column) ? numberValue(original) : DATES.has(column) ? dateValue(original) : column === "is_base" ? [true, "true", "yes", "1"].includes(String(original).toLowerCase()) : typeof original === "string" ? original.trim() : original;
  }
  return row;
}
async function lookup(supabase: SupabaseClient, table: string) {
  const { data, error } = await supabase.from(table).select("id,name");
  if (error) throw new Error(`Table "${table}": could not read existing records. ${errorText(error)}`);
  return new Map((data || []).filter((row) => row.name).map((row) => [String(row.name).trim(), row.id]));
}
async function write(supabase: SupabaseClient, table: string, rows: Row[], conflict?: string) {
  for (let start = 0; start < rows.length; start += 500) {
    const query = supabase.from(table);
    const { error } = conflict ? await query.upsert(rows.slice(start, start + 500), { onConflict: conflict }) : await query.insert(rows.slice(start, start + 500));
    if (error) throw new Error(`Table "${table}": could not write rows ${start + 1}-${Math.min(start + 500, rows.length)}. ${errorText(error)}`);
  }
}

export async function importWorkbook(supabase: SupabaseClient, bytes: ArrayBuffer) {
  const workbook = XLSX.read(bytes, { type: "array", cellDates: true });
  const tables = new Map<string, Row[]>();
  const skipped: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const table = SHEET_TABLES[normalise(sheetName)];
    if (!table) { skipped.push(sheetName); continue; }
    const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[sheetName], { defval: null, raw: true }).map((row) => cleanRow(table, row)).filter((row) => Object.keys(row).length);
    tables.set(table, [...(tables.get(table) || []), ...rows]);
  }
  if (!tables.size) throw new Error("No supported, non-empty worksheets were found.");

  const counts: Record<string, number> = {};
  // Currency names are required by the schema, while spreadsheets commonly
  // contain only a code (for example, "USD"). In that case the code itself is
  // a clear, valid display name.
  const currencyRows = (tables.get("currencies") || [])
    .filter((row) => row.code)
    .map((row) => ({
      ...row,
      code: String(row.code).trim().toUpperCase(),
      name: row.name || String(row.code).trim().toUpperCase(),
      rate_to_base: row.rate_to_base ?? 1,
    }));
  tables.set("currencies", currencyRows);
  for (const [table, conflict] of [["currencies", "code"], ["chart_of_accounts", "category,group_type"], ["classifications", "name"], ["treasury_accounts", "name"]] as const) {
    const rows = tables.get(table) || [];
    if (rows.length) { await write(supabase, table, rows, conflict); counts[table] = rows.length; }
  }
  const clients = tables.get("clients") || [];
  if (clients.length) {
    const names = await lookup(supabase, "clients");
    const newClients = clients.filter((row) => row.name && !names.has(String(row.name)));
    if (newClients.length) await write(supabase, "clients", newClients);
    counts.clients = newClients.length;
  }
  const clientIds = await lookup(supabase, "clients");
  const treasuryIds = await lookup(supabase, "treasury_accounts");
  const sites = tables.get("guest_post_sites") || [];
  for (const row of sites) { if (row.client_name) { row.client_id = clientIds.get(String(row.client_name)); delete row.client_name; } }
  if (sites.length) { await write(supabase, "guest_post_sites", sites, "name"); counts.guest_post_sites = sites.length; }
  const siteIds = await lookup(supabase, "guest_post_sites");
  for (const table of ["client_balances", "invoices", "transactions", "guest_post_ledger", "content_billing", "content_details"]) {
    const rows: Row[] = [];
    for (const source of tables.get(table) || []) {
      const row = { ...source };
      if (row.client_name) { row.client_id = clientIds.get(String(row.client_name)); if (table === "content_billing") row.client_name_raw ||= String(row.client_name); delete row.client_name; }
      if (row.treasury_name) { row.treasury_account_id = treasuryIds.get(String(row.treasury_name)); delete row.treasury_name; }
      if (row.site_name) { row.site_id = siteIds.get(String(row.site_name)); delete row.site_name; }
      if (source.client_name && !row.client_id) {
        throw new Error(`Table "${table}": client "${String(source.client_name)}" was not found in the Clients sheet or database.`);
      }
      if (source.treasury_name && !row.treasury_account_id) {
        throw new Error(`Table "${table}": treasury "${String(source.treasury_name)}" was not found in the Treasuries sheet or database.`);
      }
      if (source.site_name && !row.site_id) {
        throw new Error(`Table "${table}": guest-post site "${String(source.site_name)}" was not found in the Guest Posts sheet or database.`);
      }
      rows.push(row);
    }
    if (rows.length) { await write(supabase, table, rows, table === "guest_post_ledger" ? "site_id,month" : undefined); counts[table] = rows.length; }
  }
  return { counts, skipped };
}
