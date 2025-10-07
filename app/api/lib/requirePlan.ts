// app/api/_lib/requirePlan.ts
import { createClient } from "@/utils/supabase/server";

export type PlanRow = {
  user_id: string;
  plan: "trial" | "starter" | "business";
  subscription_status: "trialing" | "active" | "canceled" | "past_due" | string;
  current_period_end: string | null; // ISO
  receipt_limit: number | null;      // null = unlimited
};

export type PlanCheck = {
  ok: boolean;
  reason?: string;
  plan?: PlanRow;
  remaining?: number | null; // null = unlimited
};

export async function checkPlanAndQuota(): Promise<PlanCheck> {
  const sb = createClient();

  // who’s calling?
  const { data: gu } = await sb.auth.getUser();
  const uid = gu?.user?.id;
  if (!uid) return { ok: false, reason: "Not authenticated" };

  // 1) read user's plan (from your `user_plans` table or view)
  const { data: planRow } = await sb
    .from("user_plans")
    .select("user_id, plan, subscription_status, current_period_end, receipt_limit")
    .eq("user_id", uid)
    .single();

  // sensible defaults if row missing
  const now = new Date();
  const effective: PlanRow = {
    user_id: uid,
    plan: (planRow?.plan as any) ?? "trial",
    subscription_status: (planRow?.subscription_status as any) ?? "trialing",
    current_period_end: planRow?.current_period_end ?? new Date(now.getTime() + 3 * 24 * 3600 * 1000).toISOString(), // 3 days
    receipt_limit: planRow?.receipt_limit ?? 10,
  };

  // 2) if TRIAL → must be within window
  if (effective.plan === "trial") {
    const ends = new Date(effective.current_period_end!);
    if (now > ends) {
      return { ok: false, reason: "Trial expired. Upgrade to continue.", plan: effective, remaining: 0 };
    }
  }

  // 3) quota check (Starter has a number, Business is unlimited)
  let remaining: number | null = null;

  if (effective.plan !== "business") {
    // Count all receipts by this user
    const { count, error: cErr } = await sb
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid);

    if (cErr) return { ok: false, reason: "Cannot check quota.", plan: effective };

    const limit = effective.receipt_limit ?? 0;
    const used = count ?? 0;
    remaining = Math.max(0, limit - used);

    if (used >= limit) {
      const label = effective.plan === "trial" ? "Trial limit reached (10 receipts)." : "Starter plan limit reached.";
      return { ok: false, reason: `${label} Upgrade to Business for unlimited receipts.`, plan: effective, remaining: 0 };
    }
  } else {
    // business: unlimited
    remaining = null;
  }

  // 4) status check for paid plans (optional strictness)
  if (effective.plan !== "trial" && effective.subscription_status !== "active") {
    return { ok: false, reason: "Subscription not active. Please update billing.", plan: effective, remaining };
  }

  return { ok: true, plan: effective, remaining };
}
