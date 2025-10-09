// app/page.tsx
import Link from "next/link";
import PricingButtons from "@/components/PricingButtons";

export default function Home() {
  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>Business Manager Pro</h1>
        <p style={{ color: "#64748b" }}>
          Smart e-Receipts for Mauritius — BRN/VAT ready.
        </p>
      </header>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Quick links</h2>
        <ul
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li>
            <Link href="/auth">Auth</Link>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
          <li>
            <Link href="/offline">Offline</Link>
          </li>
        </ul>
      </section>

      <section id="pricing" style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Choose your plan</h2>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          {/* Starter */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Starter</h3>
            <p style={{ margin: "6px 0 12px", color: "#475569" }}>
              For solo users getting started.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#334155" }}>
              <li>Core e-receipt generator</li>
              <li>CSV/Excel export</li>
              <li>Basic support</li>
            </ul>
            <div style={{ marginTop: 14 }}>
              <PricingButtons plan="starter" />
            </div>
          </div>

          {/* Business */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Business</h3>
            <p style={{ margin: "6px 0 12px", color: "#475569" }}>
              Small teams and growing shops.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#334155" }}>
              <li>All Starter features</li>
              <li>Team seats &amp; logo upload</li>
              <li>Priority support</li>
            </ul>
            <div style={{ marginTop: 14 }}>
              <PricingButtons plan="business" />
            </div>
          </div>

          {/* Professional */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>Professional</h3>
            <p style={{ margin: "6px 0 12px", color: "#475569" }}>
              For high-volume and advanced needs.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#334155" }}>
              <li>All Business features</li>
              <li>API access &amp; webhooks</li>
              <li>Dedicated support</li>
            </ul>
            <div style={{ marginTop: 14 }}>
              <PricingButtons plan="pro" />
            </div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: 28, fontSize: 12, color: "#64748b" }}>
        <Link href="/privacy.html">Privacy</Link> · <Link href="/terms.html">Terms</Link>
      </footer>
    </main>
  );
}
