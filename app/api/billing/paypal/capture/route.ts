import { NextResponse } from "next/server";
import { upsertActiveSubscription } from "@/utils/billing/supabase";

async function token() {
  const r = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer
      .from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64") },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  return (await r.json()).access_token as string;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("token");
  if (!orderId) return NextResponse.redirect(new URL("/billing/cancel", process.env.NEXT_PUBLIC_BASE_URL));

  const t = await token();
  const cap = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${t}` }
  });
  const data = await cap.json();
  const custom = data.purchase_units?.[0]?.custom_id || "";
  const [userId, plan] = custom.split(":");
  if (userId && plan) await upsertActiveSubscription({ userId, plan, provider: "paypal" });

  return NextResponse.redirect(new URL("/billing/success", process.env.NEXT_PUBLIC_BASE_URL));
}
