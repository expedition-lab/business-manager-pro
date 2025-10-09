// app/page.tsx
import Link from "next/link";
import PricingButtons from "@/components/PricingButtons";

export default function Home() {
  return (
    <>
      {/* Sticky Nav */}
      <nav
        className="nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(11,19,36,0.95)",
          borderBottom: "1px solid rgba(15,23,42,0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="wrap"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Link href="/" className="brand" aria-label="Home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, color: "#e2e8f0", fontWeight: 800 }}>
            <div className="brand-logo" style={{ width: 36, height: 36, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
              B
            </div>
            <span>Business Manager Pro</span>
          </Link>

          <div style={{ display: "flex", gap: 14, marginLeft: 16 }}>
            <a href="#features" style={{ color: "#e2e8f0", textDecoration: "none" }}>Features</a>
            <a href="#pricing" style={{ color: "#e2e8f0", textDecoration: "none" }}>Pricing</a>
            <a href="#generator" style={{ color: "#e2e8f0", textDecoration: "none" }}>Try Demo</a>
            <a href="#faq" style={{ color: "#e2e8f0", textDecoration: "none" }}>FAQ</a>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link className="btn" href="/auth" style={btn()}>Sign In</Link>
            <Link className="btn primary" href="/auth?mode=signup" style={btnPrimary()}>Sign Up Free</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        style={{
          background: "linear-gradient(135deg,#0b1324 0%,#1e3a8a 45%,#3b82f6 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="wrap"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "60px 16px",
            display: "grid",
            gap: 40,
            gridTemplateColumns: "1.1fr 0.9fr",
            alignItems: "center",
          }}
        >
          <div>
            <span
              className="badge"
              style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 999,
                padding: "6px 14px",
                color: "#e0ecff",
                background: "rgba(255,255,255,0.15)",
                fontWeight: 700,
                fontSize: 13,
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: "#86efac",
                  borderRadius: 999,
                  display: "inline-block",
                  animation: "pulse 2s infinite",
                }}
              />
              VAT · BRN · PDF · QR Code
            </span>

            <h1 style={{ fontSize: "clamp(32px,5vw,58px)", lineHeight: 1.1, margin: "0.6em 0 0.3em", fontWeight: 900 }}>
              Smart E-Receipts for Modern Businesses
            </h1>
            <p style={{ fontSize: 18, opacity: 0.95, maxWidth: 560, marginBottom: 24 }}>
              Create and send professional e-receipts in seconds. Track revenue, export to Excel. Built for Mauritian BRN/VAT compliance.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/auth?mode=signup" style={{ ...btnPrimary(), fontSize: 16, padding: "16px 32px" }}>
                Start Free Trial (3 Days) →
              </Link>
              <a className="btn ghost" href="#generator" style={{ ...btnGhost() }}>
                See Live Demo
              </a>
            </div>

            <p style={{ fontSize: 14, opacity: 0.9, marginTop: 12 }}>
              ✓ No credit card required · ✓ Cancel anytime · ✓ Setup in 2 minutes
            </p>
          </div>

          {/* Simple “receipt” visual card (static preview). Replace with your own image if you have one. */}
          <div>
            <div
              className="card"
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 24,
                color: "#0f172a",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}
            >
              <h3 style={{ marginBottom: 8 }}>Real Receipt Preview</h3>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
                Professional receipts your customers will love
              </p>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #e5e7eb", paddingBottom: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: "#2563eb" }}>Your Company Ltd</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Port Louis, Mauritius • BRN: C12345678</div>
                  </div>
                  <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                    PAID
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, fontSize: 14 }}>
                  <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>Receipt #R-2025-0142 • 09 Oct 2025</div>
                  <div />
                  <div>Professional Services</div>
                  <div>Rs 2,500</div>
                  <div>VAT (15%)</div>
                  <div>Rs 375</div>
                  <div style={{ fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 6 }}>Total</div>
                  <div style={{ fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 6 }}>Rs 2,875</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                <a href="#generator" className="btn primary" style={btnPrimary()}>📄 Try Generator</a>
                <a href="#pricing" className="btn" style={btn()}>💰 See Pricing</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 16px" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 12, fontWeight: 800, color: "#0f172a" }}>
            Everything you need to succeed
          </h2>
          <p style={{ color: "#475569", fontSize: 18, marginBottom: 32 }}>Professional tools that don't break the bank</p>

          <div
            className="grid3"
            style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}
          >
            {[
              { icon: "📄", title: "Professional Receipts", desc: "Add your logo, customize colors, include all required details." },
              { icon: "✓", title: "MRA Compliant", desc: "Automatic VAT (15%), BRN, unique references, verification links." },
              { icon: "⚡", title: "Lightning Fast", desc: "Create receipts in under 30 seconds. Works great on mobile." },
              { icon: "💳", title: "Payments", desc: "Stripe, PayPal, bank transfer, and JUICE (manual proof) supported." },
              { icon: "📊", title: "Simple Dashboard", desc: "Track revenue, export CSV/Excel for your accountant." },
              { icon: "🔒", title: "Secure & Backed Up", desc: "Bank-grade security with daily backups." },
            ].map((f) => (
              <div key={f.title} className="card" style={card()}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ marginBottom: 8, color: "#0f172a" }}>{f.title}</h3>
                <p style={{ color: "#475569" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING (uses your live PricingButtons) */}
      <section id="pricing" style={{ background: "#f8fafc" }}>
        <div className="wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 16px" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 12, fontWeight: 800, color: "#0f172a" }}>
            Pricing built for every business
          </h2>
          <p style={{ color: "#475569", fontSize: 18, marginBottom: 12 }}>
            Choose the plan that fits your needs. All plans include a 3-day free trial.
          </p>
          <p style={{ color: "#10b981", fontWeight: 700, marginBottom: 28 }}>
            💰 Pay annually and save 2 months on all plans!
          </p>

          <div
            className="grid"
            style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            {/* Starter */}
            <div className="card" style={card()}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Starter</h3>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "12px 0" }}>
                Rs 599 <span style={{ fontSize: 16, fontWeight: 400, color: "#64748b" }}>/month</span>
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>Rs 5,990/year (save Rs 1,198)</div>
              <ul style={ul()}>
                <li><strong>200 receipts/month</strong></li>
                <li>Custom logo & branding</li>
                <li>PDF download & share</li>
                <li>CSV & Excel exports</li>
                <li>Email support (24h)</li>
                <li>QR verification codes</li>
              </ul>
              <div style={{ marginTop: 14 }}>
                <PricingButtons plan="starter" />
              </div>
            </div>

            {/* Business */}
            <div className="card" style={{ ...card(), border: "2px solid #2563eb", boxShadow: "0 15px 40px rgba(37,99,235,0.18)" }}>
              <div style={{ marginBottom: 8, fontWeight: 700, color: "#1e40af" }}>⭐ Most Popular</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Business</h3>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "12px 0" }}>
                Rs 1,199 <span style={{ fontSize: 16, fontWeight: 400, color: "#64748b" }}>/month</span>
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>Rs 11,990/year (save Rs 2,398)</div>
              <ul style={ul()}>
                <li><strong>1,000 receipts/month</strong></li>
                <li>Everything in Starter</li>
                <li>5 team members</li>
                <li>Priority support (&lt;8h)</li>
                <li>Advanced analytics</li>
                <li>Custom templates</li>
              </ul>
              <div style={{ marginTop: 14 }}>
                <PricingButtons plan="business" />
              </div>
            </div>

            {/* Pro */}
            <div className="card" style={card()}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Professional</h3>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "12px 0" }}>
                Rs 1,899 <span style={{ fontSize: 16, fontWeight: 400, color: "#64748b" }}>/month</span>
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>Rs 18,990/year (save Rs 3,798)</div>
              <ul style={ul()}>
                <li><strong>Unlimited receipts</strong></li>
                <li>Everything in Business</li>
                <li>15 team members</li>
                <li>Priority support (&lt;2h)</li>
                <li>API access & webhooks</li>
                <li>White-label branding</li>
              </ul>
              <div style={{ marginTop: 14 }}>
                <PricingButtons plan="pro" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE DEMO ANCHOR (you can replace with your full generator later) */}
      <section id="generator">
        <div className="wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 16px" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 12, fontWeight: 800, color: "#0f172a" }}>
            Try the Receipt Generator
          </h2>
          <p style={{ color: "#475569", fontSize: 18, marginBottom: 20 }}>
            Test it yourself—create a professional receipt right now. No signup required for the demo.
          </p>
          <div className="card" style={card()}>
            <p style={{ margin: 0 }}>
              (Coming up next: plug your existing demo form here, or link to your protected app page.)
            </p>
          </div>
        </div>
      </section>

      {/* FAQ (placeholder) */}
      <section id="faq" style={{ background: "#f8fafc" }}>
        <div className="wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 16px" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 12, fontWeight: 800, color: "#0f172a" }}>
            Common Questions
          </h2>
          <div className="card" style={card()}>
            <p style={{ margin: 0 }}>
              Add your expandable FAQ here (pricing, compliance, payments, refunds, etc.).
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          background: "#fff",
          marginTop: 40,
        }}
      >
        <div className="wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px", color: "#64748b", fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>© {new Date().getFullYear()} Business Manager Pro. All rights reserved.</div>
            <div style={{ display: "flex", gap: 20 }}>
              <Link href="/privacy.html">Privacy</Link>
              <Link href="/terms.html">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ---------- tiny inline style helpers ---------- */
function card(): React.CSSProperties {
  return {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "transform .2s",
  };
}
function ul(): React.CSSProperties {
  return { margin: 0, paddingLeft: 18, color: "#334155", listStyle: "none" };
}
function btn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.1)",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 600,
    textDecoration: "none",
  };
}
function btnPrimary(): React.CSSProperties {
  return {
    ...btn(),
    background: "linear-gradient(135deg,#2563eb,#1e40af)",
    color: "#fff",
    border: "none",
    boxShadow: "0 10px 30px rgba(37,99,235,.25)",
  };
}
function btnGhost(): React.CSSProperties {
  return {
    ...btn(),
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
  };
}
