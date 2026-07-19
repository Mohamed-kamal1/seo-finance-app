"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/", label: "Dashboard", glyph: "▤" },
  { href: "/clients", label: "Clients", glyph: "◈" },
  { href: "/invoices", label: "Invoices", glyph: "𝍒" },
  { href: "/guest-posts", label: "Guest Posts", glyph: "⌗" },
  { href: "/content-billing", label: "Content Billing", glyph: "✎" },
  { href: "/transactions", label: "Ledger", glyph: "≣" },
  { href: "/treasuries", label: "Treasuries", glyph: "⛁" },
  { href: "/chart-of-accounts", label: "Chart of Accounts", glyph: "☰" },
  { href: "/reports", label: "Reports", glyph: "◱" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-line bg-panel flex flex-col">
      <div className="px-5 py-6 border-b border-line">
        <div className="font-display text-lg tracking-tight text-white">SEO House</div>
        <div className="text-xs text-muted font-mono-num mt-0.5">FINANCE LEDGER</div>
      </div>
      <nav className="flex-1 py-4">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active
                  ? "text-accent bg-[rgba(62,214,166,0.08)] border-r-2 border-accent"
                  : "text-muted hover:text-white"
              }`}
            >
              <span className="w-4 text-center">{item.glyph}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-line">
        <button
          onClick={signOut}
          className="text-xs text-muted hover:text-danger transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
