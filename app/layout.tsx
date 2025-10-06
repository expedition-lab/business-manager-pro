// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // <-- keep if you have Tailwind or global CSS

export const metadata: Metadata = {
  title: "Business Manager Pro",
  description: "Generate e-receipts fast",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
