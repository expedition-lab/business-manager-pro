// app/paywall/page.tsx
"use client";
import { useEffect } from "react";

export default function Paywall() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=EUR`;
    s.onload = () => {
      // @ts-ignore
      window.paypal.Buttons({
        createOrder: async () => {
          // Call server to create an order
          const r = await fetch("/api/paypal/create-order", { method: "POST" });
          const { id } = await r.json();
          return id; // PayPal order id
        },
        onApprove: async (data: any) => {
          // Capture on server; it will verify + mark user active
          const r = await fetch("/api/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: data.orderID }),
          });
          const ok = r.ok;
          if (ok) window.location.href = "/"; // back to app
          else alert("Payment verification failed");
        },
      }).render("#pp");
    };
    document.body.appendChild(s);
  }, []);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-2">Activate your account</h1>
      <p className="mb-6">Get instant access to Business Manager Pro.</p>
      <div id="pp" />
      <p className="mt-6 text-sm opacity-70">
        Need help? WhatsApp +230 5496 0101
      </p>
    </main>
  );
}
