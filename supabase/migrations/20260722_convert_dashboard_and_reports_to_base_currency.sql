-- Dashboard/report aggregate values are stored and displayed in the base
-- currency (EGP). A transaction takes the currency of its treasury account;
-- transactions without a treasury are treated as already being in EGP.

create or replace view v_income_statement as
select
  date_trunc('month', tx.actual_date)::date as month,
  tx.classification_is as category,
  sum(tx.debit * coalesce(c.rate_to_base, 1)) as total_in,
  sum(tx.credit * coalesce(c.rate_to_base, 1)) as total_out,
  sum((tx.debit - tx.credit) * coalesce(c.rate_to_base, 1)) as net
from transactions tx
left join treasury_accounts t on t.id = tx.treasury_account_id
left join currencies c on c.code = t.currency_code
where tx.classification_is is not null
group by 1, 2
order by 1, 2;

create or replace view v_cash_flow as
select
  date_trunc('month', coalesce(tx.cf_date, tx.actual_date))::date as month,
  tx.classification_cf as category,
  sum(tx.debit * coalesce(c.rate_to_base, 1)) as total_in,
  sum(tx.credit * coalesce(c.rate_to_base, 1)) as total_out,
  sum((tx.debit - tx.credit) * coalesce(c.rate_to_base, 1)) as net
from transactions tx
left join treasury_accounts t on t.id = tx.treasury_account_id
left join currencies c on c.code = t.currency_code
where tx.classification_cf is not null
group by 1, 2
order by 1, 2;

create or replace view v_treasury_balances as
select
  t.id as treasury_account_id,
  t.name,
  t.currency_code,
  t.opening_balance + coalesce(sum(tx.debit), 0) - coalesce(sum(tx.credit), 0) as current_balance,
  (t.opening_balance + coalesce(sum(tx.debit), 0) - coalesce(sum(tx.credit), 0))
    * coalesce(c.rate_to_base, 1) as current_balance_base
from treasury_accounts t
left join transactions tx on tx.treasury_account_id = t.id
left join currencies c on c.code = t.currency_code
group by t.id, t.name, t.currency_code, t.opening_balance, c.rate_to_base;

create or replace view v_client_outstanding as
select distinct on (b.client_id)
  b.client_id,
  b.as_of_date,
  b.current_due,
  b.total_amount,
  b.currency_code,
  b.current_due * coalesce(c.rate_to_base, 1) as current_due_base,
  b.total_amount * coalesce(c.rate_to_base, 1) as total_amount_base
from client_balances b
left join currencies c on c.code = b.currency_code
order by b.client_id, b.as_of_date desc;

create or replace view v_monthly_summary as
select
  date_trunc('month', tx.actual_date)::date as month,
  sum(tx.debit * coalesce(c.rate_to_base, 1)) as revenue,
  sum(tx.credit * coalesce(c.rate_to_base, 1)) as expenses,
  sum((tx.debit - tx.credit) * coalesce(c.rate_to_base, 1)) as net
from transactions tx
left join treasury_accounts t on t.id = tx.treasury_account_id
left join currencies c on c.code = t.currency_code
group by 1
order by 1;
