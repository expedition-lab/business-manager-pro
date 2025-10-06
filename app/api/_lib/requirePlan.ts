import { createClient } from "@supabase/supabase-js";

export async function requirePlan(req: Request) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
  );

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: gu } = await sb.auth.getUser(token);
  if (!gu?.user) return { error: "Not authenticated", status: 401 } as const;

  const { data: planRow, error } = await sb
    .from("user_plans")
    .select("plan, subscription_status, current_period_end, receipt_limit")
    .eq("user_id", gu.user.id)
    .single();

  if (error || !planRow) return { error: "Plan not found", status: 403 } as const;

  const now = new Date();
  const end = planRow.current_period_end ? new Date(planRow.current_period_end) : now;
  const active = planRow.subscription_status === "active" && end > now;
  const trialing = planRow.subscription_status === "trialing" && end > now;

  return { userId: gu.user.id, plan: planRow.plan, active, trialing, limit: planRow.receipt_limit } as const;
}
