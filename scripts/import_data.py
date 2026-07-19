"""
Imports data from clients.xlsx and Finance_2026.xlsx into Supabase.

Usage:
    pip install -r requirements.txt
    export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
    export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # NOT the anon key
    python import_data.py --clients /path/to/clients.xlsx --finance /path/to/Finance_2026.xlsx
    python import_data.py --clients ... --finance ... --dry-run   # preview counts only

Notes / known limitations (the source workbook is a hand-built spreadsheet,
so some sheets don't map cleanly to tables — read before trusting the import):
  - "Chart of Account" sheet is actually two unrelated Excel dropdown-source
    lists, not a real table, so we skip it and instead build the chart of
    accounts from the categories actually used in the Transactions sheet.
  - "Treasures" sheet is a repeating block layout (per-treasury mini-ledgers)
    that's too fragile to parse generically. Treasury accounts are created
    from the distinct names found in Transactions' "Treasury" column, with
    opening_balance = 0 — adjust these manually in the app after import.
  - Amounts embedded as text ("117 KWD", "400 ريال") are parsed with a
    regex + word map. Spot-check a sample after import.
"""

import argparse
import os
import re
import sys
from datetime import datetime, date

import openpyxl
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

CURRENCY_WORDS = {
    "ريال": "SAR", "دينار": "KWD", "درهم": "AED", "دولار": "USD",
    "جنيه": "EGP", "جنية": "EGP", "دك": "KWD",
    "SAR": "SAR", "KWD": "KWD", "AED": "AED", "USD": "USD", "EGP": "EGP",
}

NUM_RE = re.compile(r"[-+]?\d[\d,\.]*")


def parse_amount(val):
    """Returns (amount: float, currency_code: str | None) from a cell value."""
    if val is None or val == "":
        return 0.0, None
    if isinstance(val, (int, float)):
        return float(val), None
    s = str(val).strip()
    m = NUM_RE.search(s)
    amount = float(m.group().replace(",", "")) if m else 0.0
    currency = None
    for word, code in CURRENCY_WORDS.items():
        if word in s:
            currency = code
            break
    return amount, currency


def as_date(val):
    if val is None:
        return None
    if isinstance(val, datetime):
        return val.date().isoformat()
    if isinstance(val, date):
        return val.isoformat()
    return None


def sheet_rows(ws, header_row_idx, min_col=1, max_col=None):
    """Yield dict rows keyed by header, starting after header_row_idx (1-indexed)."""
    headers = [c.value for c in ws[header_row_idx]]
    for row in ws.iter_rows(min_row=header_row_idx + 1, values_only=True):
        record = {}
        for i, h in enumerate(headers):
            if h is None:
                continue
            key = str(h).strip()
            record[key] = row[i] if i < len(row) else None
        if any(v is not None for v in record.values()):
            yield record


def find_header_row(ws, marker, search_col=1, max_row=10):
    for r in range(1, max_row + 1):
        if ws.cell(row=r, column=search_col).value == marker:
            return r
    raise ValueError(f"Could not find header row with marker '{marker}' in sheet '{ws.title}'")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--clients", required=True, help="Path to clients.xlsx")
    parser.add_argument("--finance", required=True, help="Path to Finance_2026.xlsx")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see scripts/requirements.txt docstring).")
        sys.exit(1)

    supabase = create_client(url, key)

    clients_wb = openpyxl.load_workbook(args.clients, data_only=True)
    finance_wb = openpyxl.load_workbook(args.finance, data_only=True)

    # ------------------------------------------------------------------
    # 1) Clients + balance snapshots, from clients.xlsx "Clients Balances"
    # ------------------------------------------------------------------
    ws = clients_wb["Clients Balances"]
    header_row = find_header_row(ws, "Client Name")
    as_of = as_date(ws.cell(row=1, column=1).value) or date.today().isoformat()

    clients_to_insert = {}
    balances_to_insert = []

    for rec in sheet_rows(ws, header_row):
        name = rec.get("Client Name")
        if not name or not str(name).strip():
            continue
        name = str(name).strip()

        seo_amt, cur = parse_amount(rec.get("Seo"))
        guest_amt, cur2 = parse_amount(rec.get("Guest"))
        hosting_amt, cur3 = parse_amount(rec.get("Hosting/Domain"))
        content_amt, cur4 = parse_amount(rec.get("Content"))
        past_due, _ = parse_amount(rec.get("Past Due"))
        discount, _ = parse_amount(rec.get("Discount"))
        total, cur5 = parse_amount(rec.get("Total Amount"))
        collections, _ = parse_amount(rec.get("Collections"))
        current_due, _ = parse_amount(rec.get("Current Due"))
        currency = cur or cur2 or cur3 or cur4 or cur5

        if name not in clients_to_insert:
            clients_to_insert[name] = {
                "name": name,
                "website": (str(rec.get("Website")).strip() if rec.get("Website") else None),
                "country": (str(rec.get("Country")).strip() if rec.get("Country") else None),
                "payment_duration": rec.get("Payment Duration"),
                "currency_code": currency,
                "seo_fee": seo_amt,
                "guest_fee": guest_amt,
                "hosting_fee": hosting_amt,
                "content_fee": content_amt,
                "contract_date": as_date(rec.get("تاريخ التعاقد")),
                "billing_day": rec.get("مبلغ الفاتورة") if isinstance(rec.get("مبلغ الفاتورة"), str) else None,
                "status": "active",
            }

        balances_to_insert.append({
            "_client_name": name,
            "as_of_date": as_of,
            "seo": seo_amt, "guest": guest_amt, "hosting_domain": hosting_amt, "content": content_amt,
            "past_due": past_due, "discount": discount, "total_amount": total,
            "collections": collections, "current_due": current_due, "currency_code": currency,
        })

    print(f"Parsed {len(clients_to_insert)} unique clients, {len(balances_to_insert)} balance snapshots.")

    # ------------------------------------------------------------------
    # 2) Chart of accounts, derived from Transactions classifications
    # ------------------------------------------------------------------
    tx_ws = finance_wb["Transactions"]
    tx_header_row = find_header_row(tx_ws, " Actual Date")
    tx_records = list(sheet_rows(tx_ws, tx_header_row))

    is_categories = sorted({r["Classifications / IS"] for r in tx_records if r.get("Classifications / IS")})
    cf_categories = sorted({r["Classifications / CF"] for r in tx_records if r.get("Classifications / CF")})
    treasury_names = sorted({r["Treasury"] for r in tx_records if r.get("Treasury")})

    print(f"Found {len(is_categories)} IS categories, {len(cf_categories)} CF categories, {len(treasury_names)} treasuries in Transactions.")

    # ------------------------------------------------------------------
    # 3) Manual invoices
    # ------------------------------------------------------------------
    inv_ws = finance_wb["Manual Invoices"]
    inv_header_row = find_header_row(inv_ws, "Internal ID")
    invoices_to_insert = []
    for rec in sheet_rows(inv_ws, inv_header_row):
        name = rec.get("Client Name")
        if not name or not str(name).strip():
            continue
        name = str(name).strip()
        seo_amt, cur = parse_amount(rec.get("Seo"))
        guest_amt, _ = parse_amount(rec.get("Guest"))
        hosting_amt, _ = parse_amount(rec.get("Hosting/Domain"))
        content_amt, _ = parse_amount(rec.get("Content"))
        past_due, _ = parse_amount(rec.get("Past Due"))
        discount, _ = parse_amount(rec.get("Discount"))
        total, cur5 = parse_amount(rec.get("Total Amount"))
        collections, _ = parse_amount(rec.get("Collections"))
        current_due, _ = parse_amount(rec.get("Current Due"))
        invoice_date = as_date(rec.get("Date")) or date.today().isoformat()

        # register client if new (from invoices sheet, in case not in Clients Balances)
        if name not in clients_to_insert:
            clients_to_insert[name] = {
                "name": name,
                "website": (str(rec.get("Website")).strip() if rec.get("Website") else None),
                "country": (str(rec.get("Country")).strip() if rec.get("Country") else None),
                "payment_duration": rec.get("Payment Duration"),
                "currency_code": cur or cur5,
                "seo_fee": 0, "guest_fee": 0, "hosting_fee": 0, "content_fee": 0,
                "status": "active",
            }

        invoices_to_insert.append({
            "_client_name": name,
            "internal_id": str(rec.get("Internal ID")) if rec.get("Internal ID") is not None else None,
            "invoice_date": invoice_date,
            "seo": seo_amt, "guest": guest_amt, "hosting_domain": hosting_amt, "content": content_amt,
            "past_due": past_due, "discount": discount, "total_amount": total,
            "collections": collections, "current_due": current_due,
            "currency_code": cur or cur5,
            "collection_status": rec.get("Collection Status") or "Pending",
        })

    print(f"Parsed {len(invoices_to_insert)} manual invoices.")

    # ------------------------------------------------------------------
    # 4) Guest Post site ledgers (repeating 5-column block per month)
    # ------------------------------------------------------------------
    gp_ws = finance_wb["Guest Post"]
    gp_sites = set()
    gp_entries = []
    # Column A = site name; data starts at row 4 (row1=month headers, row3=column headers)
    block_start_cols = list(range(2, gp_ws.max_column + 1, 5))  # B, G, L, ...
    for row_idx in range(4, gp_ws.max_row + 1):
        site_name = gp_ws.cell(row=row_idx, column=1).value
        if not site_name or not str(site_name).strip():
            continue
        site_name = str(site_name).strip()
        gp_sites.add(site_name)
        for block_i, col in enumerate(block_start_cols):
            month_num = block_i + 1  # blocks run Jan, Feb, Mar... in column order
            if month_num > 12:
                break
            beg = gp_ws.cell(row=row_idx, column=col).value
            credit = gp_ws.cell(row=row_idx, column=col + 1).value
            content = gp_ws.cell(row=row_idx, column=col + 2).value
            transfer = gp_ws.cell(row=row_idx, column=col + 3).value
            current = gp_ws.cell(row=row_idx, column=col + 4).value
            if all(v is None for v in (beg, credit, content, transfer, current)):
                continue
            gp_entries.append({
                "_site_name": site_name,
                "month": date(2026, month_num, 1).isoformat(),
                "beg_balance": float(beg or 0),
                "credit": float(credit or 0),
                "content": float(content or 0),
                "transfer": float(transfer or 0),
                "current_balance": float(current or 0),
            })

    print(f"Parsed {len(gp_sites)} guest post sites, {len(gp_entries)} monthly ledger entries.")

    # ------------------------------------------------------------------
    # 5) Content billing (per-client per-word pricing, single snapshot)
    # ------------------------------------------------------------------
    content_ws = finance_wb["Content"]
    content_rows = []
    for row_idx in range(3, content_ws.max_row + 1):
        name = content_ws.cell(row=row_idx, column=1).value
        if not name or not str(name).strip():
            continue
        details = content_ws.cell(row=row_idx, column=2).value
        required_raw = content_ws.cell(row=row_idx, column=3).value
        paid_raw = content_ws.cell(row=row_idx, column=6).value
        balance_raw = content_ws.cell(row=row_idx, column=7).value
        required_amt, cur1 = parse_amount(required_raw)
        paid_amt, _ = parse_amount(paid_raw)
        balance_amt, cur3 = parse_amount(balance_raw)
        content_rows.append({
            "client_name_raw": str(name).strip(),
            "details": str(details).strip() if details else None,
            "required_amount": required_amt,
            "paid_amount": paid_amt,
            "balance": balance_amt,
            "currency_code": cur1 or cur3,
        })

    print(f"Parsed {len(content_rows)} content billing rows.")

    if args.dry_run:
        print("\n--dry-run set: no data written. Re-run without it to import.")
        return

    # ------------------------------------------------------------------
    # Write: currencies already seeded by schema.sql — skip.
    # ------------------------------------------------------------------

    # Chart of accounts
    coa_rows = [{"category": c, "group_type": "IS"} for c in is_categories] + \
               [{"category": c, "group_type": "CF"} for c in cf_categories]
    if coa_rows:
        supabase.table("chart_of_accounts").upsert(coa_rows, on_conflict="category,group_type").execute()
        print(f"Inserted {len(coa_rows)} chart-of-account categories.")

    # Treasury accounts
    treasury_id_by_name = {}
    for tname in treasury_names:
        res = supabase.table("treasury_accounts").upsert(
            {"name": tname, "opening_balance": 0}, on_conflict="name"
        ).execute()
        treasury_id_by_name[tname] = res.data[0]["id"]
    print(f"Inserted {len(treasury_id_by_name)} treasury accounts.")

    # Clients
    client_id_by_name = {}
    for name, payload in clients_to_insert.items():
        clean = {k: v for k, v in payload.items() if not k.startswith("_")}
        res = supabase.table("clients").insert(clean).execute()
        client_id_by_name[name] = res.data[0]["id"]
    print(f"Inserted {len(client_id_by_name)} clients.")

    # Balances
    balance_rows = []
    for b in balances_to_insert:
        cid = client_id_by_name.get(b["_client_name"])
        if not cid:
            continue
        row = {k: v for k, v in b.items() if not k.startswith("_")}
        row["client_id"] = cid
        balance_rows.append(row)
    for i in range(0, len(balance_rows), 500):
        supabase.table("client_balances").insert(balance_rows[i:i + 500]).execute()
    print(f"Inserted {len(balance_rows)} client balance snapshots.")

    # Invoices
    invoice_rows = []
    for inv in invoices_to_insert:
        cid = client_id_by_name.get(inv["_client_name"])
        if not cid:
            continue
        row = {k: v for k, v in inv.items() if not k.startswith("_")}
        row["client_id"] = cid
        invoice_rows.append(row)
    for i in range(0, len(invoice_rows), 500):
        supabase.table("invoices").insert(invoice_rows[i:i + 500]).execute()
    print(f"Inserted {len(invoice_rows)} invoices.")

    # Transactions
    tx_rows = []
    for r in tx_records:
        actual_date = as_date(r.get(" Actual Date"))
        if not actual_date:
            continue
        debit = r.get("Debit") or 0
        credit = r.get("Credit") or 0
        tx_rows.append({
            "actual_date": actual_date,
            "cf_date": as_date(r.get("CF Date")),
            "description": r.get("Transaction"),
            "debit": float(debit) if debit else 0,
            "credit": float(credit) if credit else 0,
            "classification_is": r.get("Classifications / IS"),
            "classification_cf": r.get("Classifications / CF"),
            "treasury_account_id": treasury_id_by_name.get(r.get("Treasury")),
            "statement": r.get("Statements"),
            "source": "migration",
        })
    for i in range(0, len(tx_rows), 500):
        supabase.table("transactions").insert(tx_rows[i:i + 500]).execute()
    print(f"Inserted {len(tx_rows)} transactions.")

    # Guest post sites + ledger
    site_id_by_name = {}
    for sname in sorted(gp_sites):
        res = supabase.table("guest_post_sites").upsert({"name": sname}, on_conflict="name").execute()
        site_id_by_name[sname] = res.data[0]["id"]
    print(f"Inserted {len(site_id_by_name)} guest post sites.")

    gp_ledger_rows = []
    for e in gp_entries:
        sid = site_id_by_name.get(e["_site_name"])
        if not sid:
            continue
        row = {k: v for k, v in e.items() if not k.startswith("_")}
        row["site_id"] = sid
        gp_ledger_rows.append(row)
    for i in range(0, len(gp_ledger_rows), 500):
        supabase.table("guest_post_ledger").upsert(
            gp_ledger_rows[i:i + 500], on_conflict="site_id,month"
        ).execute()
    print(f"Inserted {len(gp_ledger_rows)} guest post ledger entries.")

    # Content billing -- matched to a client by exact name where possible
    for i in range(0, len(content_rows), 500):
        batch = content_rows[i:i + 500]
        for row in batch:
            row["client_id"] = client_id_by_name.get(row["client_name_raw"])
        supabase.table("content_billing").insert(batch).execute()
    print(f"Inserted {len(content_rows)} content billing rows.")

    print("\nDone. Review data in the app — some fields (currency detection, "
          "treasury opening balances) are best-effort and worth a spot check.")


if __name__ == "__main__":
    main()
