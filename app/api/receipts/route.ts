// POST /api/receipts  -> creates a receipt and COPIES seller info onto it
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // your SSR supabase helper

export async function POST(req: NextRequest) {
  const sb = createClient();
  const { data: gu } = await sb.auth.getUser();
  if (!gu?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // 1) load the user's business profile
  const { data: bp, error: perr } = await sb
    .from("business_profiles")
    .select("business_name, brn, vat, address, phone, email, logo_url")
    .eq("user_id", gu.user.id)
    .single();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 400 });

  // 2) insert receipt with **snapshot** of seller fields
  const payload = {
    user_id: gu.user.id,
    reference_number: body.reference_number,
    client_name: body.client_name ?? null,
    client_email: body.client_email ?? null,
    client_phone: body.client_phone ?? null,
    items: body.items ?? [],
    subtotal: body.subtotal ?? 0,
    tax: body.tax ?? 0,
    total: body.total ?? 0,

    // snapshot fields (match your receipts columns from screenshot)
    business_name: bp?.business_name ?? null,
    brn: bp?.brn ?? null,
    vat_number: bp?.vat ?? null,
    business_address: bp?.address ?? null,
    business_phone: bp?.phone ?? null,
    business_email: bp?.email ?? null,
    logo_url: bp?.logo_url ?? null,
  };

  const { data, error } = await sb.from("receipts").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ receipt: data });
}
