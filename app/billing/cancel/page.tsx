// app/billing/cancel/page.tsx
import Link from "next/link";

export default function CancelPage() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Payment cancelled</h1>
      <p style={{ color: "#475569", marginTop: 0 }}>
        No charges were made. You can try again anytime.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Link className="btn-primary" href="/#pricing">Return to Pricing</Link>
        <Link className="btn-outline" href="/">Back to Home</Link>
      </div>

      <p style={{ fontSize: 12, color: "#64748b", marginTop: 24 }}>
        Need help? <a href="mailto:support@business-manager.pro">Contact support</a>.
      </p>
    </main>
  );
}
