export type Currency = {
  code: string;
  name: string;
  symbol: string | null;
  rate_to_base: number;
  is_base: boolean;
};

export type Client = {
  id: string;
  name: string;
  website: string | null;
  country: string | null;
  payment_duration: string | null;
  currency_code: string | null;
  seo_fee: number;
  guest_fee: number;
  hosting_fee: number;
  content_fee: number;
  annual_increase: number | null;
  contract_date: string | null;
  billing_day: string | null;
  service_type: string | null;
  notes: string | null;
  status: string;
};

export type ClientBalance = {
  id: string;
  client_id: string;
  as_of_date: string;
  seo: number;
  guest: number;
  hosting_domain: number;
  content: number;
  past_due: number;
  discount: number;
  total_amount: number;
  collections: number;
  current_due: number;
  currency_code: string | null;
};

export type Invoice = {
  id: string;
  internal_id: string | null;
  client_id: string | null;
  invoice_date: string;
  service: string | null;
  seo: number;
  guest: number;
  hosting_domain: number;
  content: number;
  past_due: number;
  discount: number;
  total_amount: number;
  collections: number;
  current_due: number;
  currency_code: string | null;
  collection_status: string;
  payment_date: string | null;
  notes: string | null;
};

export type Transaction = {
  id: string;
  actual_date: string;
  cf_date: string | null;
  description: string | null;
  debit: number;
  credit: number;
  classification_is: string | null;
  classification_cf: string | null;
  treasury_account_id: string | null;
  statement: string | null;
};

export type TreasuryAccount = {
  id: string;
  name: string;
  currency_code: string | null;
  opening_balance: number;
};

export type ChartOfAccount = {
  id: string;
  category: string;
  group_type: string;
};
