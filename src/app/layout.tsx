import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "SEO House — Finance Ledger",
  description: "Client & finance management",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        {user ? (
          <div className="flex">
            <Sidebar />
            <main className="ml-60 flex-1 min-h-screen">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
