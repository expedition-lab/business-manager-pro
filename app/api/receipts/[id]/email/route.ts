// app/api/receipts/[id]/email/route.ts
export const runtime = "nodejs"; // using auth/db/secrets → force Node

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkPlanAndQuota } from "@/app/api/lib/requirePlan";

type Params = { id: string };

export async function POST(req: Request, { params }: { params: Params }) {
  const sb = createClient();

  // You must read cookies on the server to identify the user; createClient()
  // should be the server version that uses next/headers under the hood.
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Business plan & quota check
  const planCheck = await checkPlanAndQuota();
  if (!planCheck.ok) {
    return NextResponse.json(
      { error: planCheck.reason || "Plan check failed" },
      { status: 402 }
    );
  }
  if (planCheck.plan?.plan !== "business") {
    return NextResponse.json(
      {
        error:
          "Email feature is only available on the Business plan. Please upgrade.",
      },
      { status: 402 }
    );
  }

  // Fetch receipt for this user
  const { data: receipt, error } = await sb
    .from("receipts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !receipt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // TODO: send email (provider + optional PDF)
  // await sendReceiptEmail({ to, receipt });

  return NextResponse.json({ ok: true, message: "Email feature coming soon!" });
}
