"use client";
import { useState } from "react";

export default function PricingButtons({ plan }:{ plan:"starter"|"business"|"pro" }) {
  const [loading, setLoading] = useState(false);

  async function goStripe() {
    setLoading(true);
    const r = await fetch(`/api/billing/stripe/create-checkout?plan=${plan}`, { method:"POST" });
    const j = await r.json();
    setLoading(false);
    if (j?.url) location.href = j.url; else alert(j?.error || "Stripe error");
  }

  async function goPayPal() {
    setLoading(true);
    const r = await fetch(`/api/billing/paypal/create-order?plan=${plan}`, { method:"POST" });
    const j = await r.json();
    setLoading(false);
    if (j?.approveUrl) location.href = j.approveUrl; else alert(j?.error || "PayPal error");
  }

  function goJuice() {
    location.href = `/pay/juice?plan=${plan}`;
  }

  return (
    <div className="flex gap-2">
      <button onClick={goStripe} disabled={loading} className="btn-primary">Pay with card</button>
      <button onClick={goPayPal} disabled={loading} className="btn-outline">PayPal</button>
      <button onClick={goJuice} disabled={loading} className="btn-ghost">JUICE</button>
    </div>
  );
}
