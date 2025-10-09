// components/Hero.tsx
"use client";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center", paddingTop: 60, paddingBottom: 60 }}>
        <div>
          <span className="badge"><span className="pulse-dot" /> VAT · BRN · PDF · QR Code</span>
          <h1 style={{ fontSize: "clamp(32px,5vw,58px)", lineHeight: 1.1, margin: "0.5em 0 0.3em 0", fontWeight: 900 }}>
            Smart E-Receipts for Modern Businesses
          </h1>
          <p style={{ fontSize: 18, maxWidth: 560, opacity: 0.95, marginBottom: 24 }}>
            Create and send professional e-receipts in seconds. Track revenue, export to Excel. Join 800+ Mauritian businesses.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn primary" href="/auth?mode=signup" style={{ fontSize: 16, padding: "16px 32px" }}>
              Start Free Trial (3 Days) →
            </Link>
            <Link className="btn ghost" href="#generator">See Live Demo</Link>
          </div>
          <p style={{ fontSize: 14, opacity: 0.85, marginTop: 12 }}>
            ✓ No credit card required · ✓ Cancel anytime · ✓ Setup in 2 minutes
          </p>
          {/* keep KPI pills if you like */}
        </div>

        {/* You can add the visual “Real Receipt Preview” later if needed */}
      </div>
    </section>
  );
}
