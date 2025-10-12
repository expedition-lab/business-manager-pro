// app/api/verify/[ref]/route.ts
export const runtime = "nodejs"; // server-only (touches DB)

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // make sure this is the *server* client

export async function GET(
  _req: Request,
  { params }: { params: { ref: string } }
) {
  const ref = decodeURIComponent(params.ref).trim();
  if (!ref) {
    return NextResponse.json({ valid: false, error: "Missing ref" }, { status: 400 });
  }

  const sb = createClient();

  // Keep selection minimal—no PII
  const { data, error } = await sb
    .from("receipts")
    .select("id, ref, total, currency, business_name, created_at") // removed `status`
    .eq("ref", ref)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 400 });
  }
  if (!data) {
    // or return 200 with {valid:false} if you prefer not to leak 404
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  return NextResponse.json(
    { valid: true, receipt: data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
