import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requirePlan } from "@/app/api/lib/requirePlan";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await requirePlan(user.id, "business"); // gate emailing for Business+

  const { data: receipt, error } = await sb
    .from("receipts")
    .select("*")
    .eq("id", ctx.params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // TODO: send email using your provider and a PDF attachment if needed
  // await sendReceiptEmail({ to, receipt });

  return NextResponse.json({ ok: true });
}
