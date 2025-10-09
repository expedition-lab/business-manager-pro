import { NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertActiveSubscription } from "@/utils/billing/supabase";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const buf = Buffer.from(await req.arrayBuffer());
  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err:any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
    const s: any = event.data.object;
    const userId = s.metadata?.user_id;
    const plan = s.metadata?.plan;
    if (userId && plan) await upsertActiveSubscription({ userId, plan, provider: "stripe" });
  }
  return NextResponse.json({ received: true });
}
