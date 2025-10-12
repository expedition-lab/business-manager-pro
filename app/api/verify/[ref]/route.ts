// app/api/receipts/verify/[ref]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Params = { ref: string };

export async function GET(_req: Request, { params }: { params: Params }) {
  const ref = decodeURIComponent(params.ref).trim(); // guard whitespace
  const sb = createClient();

  const { data, error } = await sb
    .from("receipts")
    .select("id, ref, total, currency, business_name, created_at, status")
    .eq("ref", ref)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 400 });
  }
  if (!data) {
    // You can also return 200 with {valid:false} if you prefer not to leak 404
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  // Optional: prevent long caching of verification results
  return NextResponse.json({ valid: true, receipt: data }, {
    headers: { "Cache-Control": "no-store" }
  });
}
