// app/api/verify/[ref]/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(_req: Request, { params }: { params: { ref: string } }) {
  const ref = decodeURIComponent(params.ref).trim();
  const sb = createClient();

  const { data, error } = await sb
    .from("receipts")
    .select("id, ref, reference_number, total, currency, business_name, created_at")
    .eq("ref", ref)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ valid: false, error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ valid: false }, { status: 404 });

  return NextResponse.json({ valid: true, receipt: data }, { headers: { "Cache-Control": "no-store" } });
}
