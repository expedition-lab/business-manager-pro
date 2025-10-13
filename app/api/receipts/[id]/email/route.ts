// app/api/receipts/[id]/email/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }   // inline type only
) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: receipt, error } = await sb
    .from("receipts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // TODO email…
  return NextResponse.json({ ok: true, id: params.id, message: "Email feature coming soon!" });
}
