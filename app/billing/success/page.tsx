
// app/billing/success/page.tsx
import Link from "next/link";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const session = searchParams?.session_id;

  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>🎉 Payment successful</h1>
      <p style={{ color: "#475569", marginTop: 0 }}>
        Your subscription is now active. You can start using all features right away.
      </p>

      {session ? (
        <p style={{ fontSize: 12, color: "#64748b" }}>
          Stripe session: <code>{session}</code>
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <Link className="btn-primary" href="/settings">Go to Settings</Link>
        <Link className="btn-outline" href="/">Back to Home</Link>
      </div>

      <p style={{ fontSize: 12, color: "#64748b", marginTop: 24 }}>
        If features are not unlocked yet, please refresh or re-login. Webhooks may take a few seconds.
      </p>
    </main>
  );
}
