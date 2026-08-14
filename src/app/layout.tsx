import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Users, Calendar, QrCode, Settings, LayoutDashboard } from "lucide-react";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SPTA System",
  description: "School Parent-Teacher Association System",
};

export const viewport: import("next").Viewport = {
  themeColor: "#0f172a",
};

import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col md:flex-row h-screen overflow-hidden`}>
        
        {session && <Navigation session={session} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 bg-slate-50/50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
