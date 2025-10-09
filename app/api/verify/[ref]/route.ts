// app/api/receipts/verify/[ref]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Public route: no auth required
export async function GET(
  _req: Request,
  ctx: { params: { ref: string } }
) {
  const ref = decodeURIComponent(ctx.params.ref);
  const sb = createClient();

  // keep the select minimal to avoid leaking PII; return only what’s safe to show publicly
  const { data, error } = await sb
    .from("receipts")
    .select("id, ref, total, currency, business_name, created_at, status")
    .eq("ref", ref)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ valid: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ valid: false }, { status: 404 });

  return NextResponse.json({ valid: true, receipt: data });
}
