// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import ClearSW from "./_components/ClearSW"; // ← add this

export const metadata = {
  title: "Business Manager Pro",
  description: "Smart e-Receipts (VAT • BRN • PDF • QR Code)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Header / Navigation */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Link href="/" style={{ fontWeight: 700, textDecoration: "none" }} aria-label="Home">
            Business Manager Pro
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/try-demo">Try Demo</Link>
            <Link href="/auth" className="btn-ghost">Sign In</Link>
            <Link href="/auth?mode=signup" className="btn-primary">Sign Up Free</Link>
          </nav>
        </header>

        {/* Page content */}
        <main>{children}</main>

        {/* TEMP: clear old SW + caches causing stale HTML/JS */}
        <ClearSW />   {/* ← keep for one deploy; remove after confirming */}
      </body>
    </html>
  );
}
