// /app/api/profile-upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const sb = createClient();

  // must be signed in
  const { data: gu } = await sb.auth.getUser();
  const user = gu?.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // ⚠️ Do NOT send user_id — DB default (auth.uid()) fills it for RLS
  const payload = {
    email: body.email ?? user.email ?? null,
    full_name: body.full_name ?? "",
    business_name: body.business_name ?? "",
    brn: body.brn ?? "",
    vat: body.vat ?? null,
    phone: body.phone ?? "",
    address: body.address ?? "",
    logo_url: body.logo_url ?? null,
  };

  // one row per user: onConflict 'user_id'
  const { data, error } = await sb
    .from("business_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ profile: data });
}
