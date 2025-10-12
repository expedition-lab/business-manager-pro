// POST /api/receipts -> creates a receipt, enforces plan/quota, and snapshots seller info
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const sb = createClient();

  // 0) who is calling?
  const { data: gu } = await sb.auth.getUser();
  const uid = gu?.user?.id;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // 1) read user's plan (table or view named user_plans)
  const { data: planRow } = await sb
    .from("user_plans")
    .select("plan, subscription_status, current_period_end, receipt_limit")
    .eq("user_id", uid)
    .single();

  // sensible defaults if row missing
  const now = new Date();
  const plan = (planRow?.plan as "trial" | "starter" | "business") ?? "trial";
  const status =
    (planRow?.subscription_status as "trialing" | "active" | "canceled" | "past_due" | string) ?? "trialing";
  const currentPeriodEndISO =
    planRow?.current_period_end ?? new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString();
  const receiptLimit =
    planRow?.receipt_limit ?? (plan === "trial" ? 10 : plan === "starter" ? 200 : null);

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
      const label = plan === "trial" ? "Trial limit reached (10 receipts)." : "Starter plan limit reached (200).";
      return NextResponse.json(
        { error: `${label} Upgrade to Business for unlimited receipts.`, plan, status, remaining: 0 },
        { status: 402 }
      );
    }
  } else {
    remaining = null;
  }

  // 2) load the user's business profile - BULLETPROOF VERSION
  const { data: profiles } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", uid);

  const bp = profiles?.[0];

  // DEBUG: Log what we got
  console.log("🔍 User ID:", uid);
  console.log("🔍 Business Profile Found:", bp);

  // 3) insert receipt with snapshot of seller fields
  const payload = {
    user_id: uid,
    reference_number: body.reference_number,
    date: body.date ?? new Date().toISOString(),
    client_name: body.client_name ?? null,
    client_email: body.client_email ?? null,
    client_phone: body.client_phone ?? null,
    items: body.items ?? [],
    subtotal: Number(body.subtotal ?? 0),
    tax: Number(body.tax ?? 0),
    total: Number(body.total ?? 0),
    payment_status: body.payment_status ?? "PAID",

    // Use ACTUAL profile data or clear fallbacks
    // user_profiles uses company_name, not business_name
    business_name: bp?.company_name || bp?.full_name || "⚠️ UPDATE PROFILE IN SETTINGS",
    brn: bp?.brn || "N/A",
    vat_number: null,
    business_address: bp?.address || "No address set",
    business_phone: bp?.phone || "No phone set",
    business_email: bp?.email || "",
    logo_url: null,
  };

  console.log("📄 Creating receipt with payload:", JSON.stringify(payload, null, 2));

  const { data, error } = await sb.from("receipts").insert(payload).select().single();
  
  if (error) {
    console.error("❌ Receipt creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log("✅ Receipt created successfully:", data);

  return NextResponse.json({ receipt: data, plan, status, remaining });
}
