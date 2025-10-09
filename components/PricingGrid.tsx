// components/PricingGrid.tsx
import PricingButtons from "@/components/PricingButtons";

export default function PricingGrid() {
  return (
    <section id="pricing" style={{ background: "#f8fafc" }}>
      <div className="wrap">
        <h2>Pricing built for every business</h2>
        <p style={{ color: "var(--muted)", fontSize: 18, marginBottom: 16 }}>
          Choose the plan that fits your needs. All plans include 3-day free trial.
        </p>
        <p style={{ color: "var(--success)", fontSize: 16, fontWeight: 700, marginBottom: 40 }}>
          💰 Pay annually and save 2 months free on all plans!
        </p>

        <div className="grid4">
          {/* Starter (best-value styles optional) */}
          <div className="card pricing-card best-value">
            <h3>Starter</h3>
            <div className="price">Rs 599 <span style={{ fontSize: 18, fontWeight: 400, color: "var(--muted)" }}>/month</span></div>
            <div className="price-note">Rs 5,990/year (save Rs 1,198)</div>
            <ul>
              <li><strong>200 receipts/month</strong></li>
              <li>Custom logo & branding</li>
              <li>PDF download & share</li>
              <li>CSV & Excel exports</li>
              <li>Email support (24h)</li>
              <li>QR verification codes</li>
            </ul>
            <div style={{ marginTop: 20 }}>
              <PricingButtons plan="starter" />
            </div>
          </div>

          {/* Business (featured) */}
          <div className="card pricing-card featured">
            <h3>Business</h3>
            <div className="price">Rs 1,199 <span style={{ fontSize: 18, fontWeight: 400, color: "var(--muted)" }}>/month</span></div>
            <div className="price-note">Rs 11,990/year (save Rs 2,398)</div>
            <ul>
              <li><strong>1,000 receipts/month</strong></li>
              <li>5 team members</li>
              <li>Priority support (&lt;8h)</li>
              <li>Advanced analytics</li>
              <li>Custom templates</li>
            </ul>
            <div style={{ marginTop: 20 }}>
              <PricingButtons plan="business" />
            </div>
          </div>

          {/* Pro */}
          <div className="card pricing-card">
            <h3>Professional</h3>
            <div className="price">Rs 1,899 <span style={{ fontSize: 18, fontWeight: 400, color: "var(--muted)" }}>/month</span></div>
            <div className="price-note">Rs 18,990/year (save Rs 3,798)</div>
            <ul>
              <li><strong>Unlimited receipts</strong></li>
              <li>15 team members</li>
              <li>API access</li>
              <li>Dedicated manager</li>
              <li>White-label branding</li>
            </ul>
            <div style={{ marginTop: 20 }}>
              <PricingButtons plan="pro" />
            </div>
          </div>

          {/* Trial (optional) */}
          <div className="card pricing-card">
            <h3>Free Trial</h3>
            <div className="price">Rs 0 <span style={{ fontSize: 18, fontWeight: 400, color: "var(--muted)" }}>/3 days</span></div>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>Try before you buy</p>
            <ul>
              <li>3 days full access</li>
              <li>50 test receipts</li>
              <li>All features unlocked</li>
            </ul>
            <div style={{ marginTop: 20 }}>
              <a className="btn" href="/auth?mode=signup">Start Free Trial</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
