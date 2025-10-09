import { NextResponse } from "next/server";
import { getUserFromServer } from "@/utils/supabase/server-auth";

const AMOUNT: Record<string,string> = { starter:"9.99", business:"14.99", pro:"24.99" };

async function token() {
  const r = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer
      .from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64") },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  return (await r.json()).access_token as string;
}

export async function POST(req: Request) {
  const plan = new URL(req.url).searchParams.get("plan") || "starter";
  const amount = AMOUNT[plan];
  if (!amount) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const user = await getUserFromServer();
  if (!user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const t = await token();
  const r = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${t}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amount }, custom_id: `${user.id}:${plan}` }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/paypal/capture`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing/cancel`,
      },
    }),
  });
  const data = await r.json();
  const approveUrl = data.links?.find((l:any)=>l.rel==="approve")?.href;
  return NextResponse.json({ approveUrl });
}
