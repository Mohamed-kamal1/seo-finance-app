import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ToastProvider from "@/components/ToastProvider";
import ThemeProvider from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/server";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "SEO House — Finance Ledger",
  description: "Client & finance management",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user: any = null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (e) {
    // Auth/cookie failure - render without sidebar to avoid breaking the app
    console.error("RootLayout: auth check failed, rendering unauthenticated layout", e);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — apply data-theme before paint */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`
        }} />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            {user ? (
              <div className="flex w-full">
                <Sidebar />
                <main id="main-content" className="flex-1 min-h-screen w-full page-enter" role="main">
                  {children}
                </main>
              </div>
            ) : (
              <div className="page-enter">{children}</div>
            )}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
