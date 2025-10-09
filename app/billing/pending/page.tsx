// app/billing/pending/page.tsx
import Link from "next/link";

export default function PendingPage() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>⏳ Payment under review</h1>
      <p style={{ color: "#475569", marginTop: 0 }}>
        We received your proof of payment. A team member will verify it shortly.
        You’ll get access as soon as it’s approved.
      </p>

      <ul style={{ marginTop: 12, color: "#334155" }}>
        <li>Typical review time: 5–30 minutes during business hours.</li>
        <li>You’ll receive an email once your plan is activated.</li>
      </ul>

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Link className="btn-primary" href="/">Back to Home</Link>
        <Link className="btn-outline" href="/pay/juice">Upload another proof</Link>
      </div>

      <p style={{ fontSize: 12, color: "#64748b", marginTop: 24 }}>
        If you uploaded the wrong file, reply to the confirmation email or write to{" "}
        <a href="mailto:billing@business-manager.pro">billing@business-manager.pro</a>.
      </p>
    </main>
  );
}
