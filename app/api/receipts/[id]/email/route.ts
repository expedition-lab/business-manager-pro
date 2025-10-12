import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkPlanAndQuota } from "@/app/api/lib/requirePlan";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check plan - emailing reserved for Business plan
  const planCheck = await checkPlanAndQuota();
  if (!planCheck.ok) {
    return NextResponse.json(
      { error: planCheck.reason || "Plan check failed" },
      { status: 402 }
    );
  }
  
  // Additional check: must be Business plan for email feature
  if (planCheck.plan?.plan !== "business") {
    return NextResponse.json(
      { error: "Email feature is only available on the Business plan. Please upgrade." },
      { status: 402 }
    );
  }

  const { data: receipt, error } = await sb
    .from("receipts")
    .select("*")
    .eq("id", ctx.params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // TODO: send email using your provider and a PDF attachment if needed
  // await sendReceiptEmail({ to, receipt });

  return NextResponse.json({ ok: true, message: "Email feature coming soon!" });
}
