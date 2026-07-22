"use client";

import { useState } from "react";
import { createCurrency, updateCurrency, deleteCurrency } from "./actions";
import { useToast } from "@/components/ToastProvider";

export default function CurrenciesTable({ currencies }: { currencies: any[] }) {
    const [refreshing, setRefreshing] = useState(false);
    const { addToast } = useToast();

    async function handleRefresh() {
        setRefreshing(true);
        try {
            const { refreshCurrencies } = await import("./actions");
            const count = await refreshCurrencies();
            addToast(`Updated ${count} currency rates from live exchange API`, "success");
        } catch (err: any) {
            addToast(err?.message || "Failed to refresh currency rates", "error");
        } finally {
            setRefreshing(false);
        }
    }

    return (
        <>
            <header className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl text-white">Currencies</h1>
                    <p className="text-sm text-muted mt-1">Manage the Egyptian-pound price of each currency. One unit of a currency equals the shown EGP price.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="border border-accent text-accent hover:bg-[rgba(62,214,166,0.08)] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-md px-4 py-2 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                    {refreshing && (
                        <span className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                    )}
                    {refreshing ? "Refreshing..." : "Refresh rates now"}
                </button>
            </header>

            <form action={createCurrency} className="card p-5 mb-8 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                <div><label className="block text-xs text-muted mb-1.5">Code</label><input name="code" required maxLength={8} placeholder="SAR" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white uppercase" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Currency name</label><input name="name" required placeholder="Saudi Riyal" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Symbol</label><input name="symbol" placeholder="$" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <div><label className="block text-xs text-muted mb-1.5">Price in EGP</label><input name="rate_to_base" type="number" min="0.0001" step="0.0001" required placeholder="12.70" className="w-full bg-panel2 border border-line rounded-md px-3 py-2 text-sm text-white" /></div>
                <button type="submit" className="bg-accent text-ink text-sm font-medium rounded-md px-4 py-2">Add currency</button>
            </form>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs text-muted uppercase tracking-wider border-b border-line"><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Symbol</th><th className="px-4 py-3 font-medium">1 unit in EGP</th><th className="px-4 py-3 font-medium">Last updated</th><th className="px-4 py-3 font-medium text-right">Update</th><th className="px-4 py-3 font-medium text-right">Delete</th></tr></thead>
                    <tbody>
                        {(currencies ?? []).map((currency: any) => (
                            <tr key={currency.code} className="ledger-row">
                                <td className="px-4 py-2.5 font-mono-num text-white">{currency.code}</td>
                                <td className="px-4 py-2.5"><form id={`currency-${currency.code}`} action={updateCurrency} /><input form={`currency-${currency.code}`} type="hidden" name="code" value={currency.code} /><input form={`currency-${currency.code}`} name="name" required defaultValue={currency.name} className="w-40 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" /></td>
                                <td className="px-4 py-2.5"><input form={`currency-${currency.code}`} name="symbol" defaultValue={currency.symbol || ""} className="w-20 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white" /></td>
                                <td className="px-4 py-2.5"><input form={`currency-${currency.code}`} name="rate_to_base" type="number" min="0.0001" step="0.0001" required defaultValue={currency.rate_to_base} className="w-28 bg-panel2 border border-line rounded-md px-2 py-1.5 text-sm text-white font-mono-num" /></td>
                                <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">{currency.updated_at ? new Date(currency.updated_at).toLocaleString() : "—"}</td>
                                <td className="px-4 py-2.5 text-right"><button form={`currency-${currency.code}`} type="submit" className="border border-accent/30 text-accent hover:bg-accent-dim hover:border-accent rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>Save</button></td>
                                <td className="px-4 py-2.5 text-right">
                                    {currency.code !== "EGP" && (
                                        <form action={deleteCurrency}>
                                            <input type="hidden" name="code" value={currency.code} />
                                            <button
                                                type="submit"
                                                className="border border-danger/30 text-danger hover:bg-[rgba(240,101,79,0.12)] hover:border-danger rounded-md px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors"
                                                onClick={(e) => { if (!window.confirm(`Delete ${currency.code}?`)) e.preventDefault(); }}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                Delete
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!currencies?.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted text-sm">No currencies found. Add one above.</td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
}

