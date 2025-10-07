// POST /api/receipts  -> creates a receipt and COPIES seller info onto it + enforces plan/quota
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const sb = createClient();

  // 0) who is calling?
  const { data: gu } = await sb.auth.getUser();
  const uid = gu?.user?.id;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // 1) read user's plan (expects a table or view named user_plans)
  const { data: planRow } = await sb
    .from("user_plans")
    .select("plan, subscription_status, current_period_end, receipt_limit")
    .eq("user_id", uid)
    .single();

  // sensible defaults if row missing
  const now = new Date();
  const plan = (planRow?.plan as "trial" | "starter" | "business") ?? "trial";
  const status = (planRow?.subscription_status as "trialing" | "active" | "canceled" | "past_due" | string) ?? "trialing";
  const currentPeriodEndISO =
    planRow?.current_period_end ??
    new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(); // trial 3 days
  const receiptLimit = planRow?.receipt_limit ?? (plan === "trial" ? 10 : plan === "starter" ? 250 : null); // business=null (unlimited)

  // 1a) trial window enforcement
  if (plan === "trial") {
    const ends = new Date(currentPeriodEndISO);
    if (now > ends) {
      return NextResponse.json(
        { error: "Trial expired. Upgrade to continue.", plan, status, remaining: 0 },
        { status: 402 }
      );
    }
  }

  // 1b) subscription status for paid plans
  if (plan !== "trial" && status !== "active") {
    return NextResponse.json(
      { error: "Subscription not active. Please update billing.", plan, status },
      { status: 402 }
    );
  }

  // 1c) quota (Starter has a number; Business is unlimited)
  let remaining: number | null = null;
  if (receiptLimit != null) {
    const { count, error: cErr } = await sb
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid);
    if (cErr) {
      return NextResponse.json({ error: "Cannot check quota." }, { status: 500 });
    }
    const used = count ?? 0;
    remaining = Math.max(0, receiptLimit - used);
    if (used >= receiptLimit) {
      const label = plan === "trial" ? "Trial limit reached (10 receipts)." : "Starter plan limit reached (250).";
      return NextResponse.json(
        { error: `${label} Upgrade to Business for unlimited receipts.`, plan, status, remaining: 0 },
        { status: 402 }
      );
    }
  } else {
    // business
    remaining = null;
  }

  // 2) load the user's business profile to snapshot seller fields
  const { data: bp, error: perr } = await sb
    .from("business_profiles")
    .select("business_name, brn, vat, address, phone, email, logo_url, id")
    .eq("user_id", uid)
    .single();

  if (perr) return NextResponse.json({ error: "Business profile missing. Fill Settings first." }, { status: 400 });

  // 3) insert receipt with **snapshot** of seller fields
  const payload = {
    user_id: uid,
    reference_number: body.reference_number, // you can auto-generate if missing
    date: body.date ?? new Date().toISOString(),
    client_name: body.client_name ?? null,
    client_email: body.client_email ?? null,
    client_phone: body.client_phone ?? null,
    items: body.items ?? [],
    subtotal: Number(body.subtotal ?? 0),
    tax: Number(body.tax ?? 0),
    total: Number(body.total ?? 0),
    payment_status: body.payment_status ?? "PAID",

    // snapshot fields (match your receipts columns)
    business_name: bp?.business_name ?? null,
    brn: bp?.brn ?? null,
    vat_number: bp?.vat ?? null,
    business_address: bp?.address ?? null,
    business_phone: bp?.phone ?? null,
    business_email: bp?.email ?? null,
    logo_url: bp?.logo_url ?? null,
  };

  const { data, error } = await sb.from("receipts").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 4) nice UX: return remaining quota (null = unlimited)
  return NextResponse.json({ receipt: data, plan, status, remaining });
}
