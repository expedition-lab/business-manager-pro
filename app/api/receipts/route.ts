// app/api/receipts/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function n(val: unknown, fallback = 0) {
  const x = typeof val === "string" ? val.trim() : val;
  const num = Number(x);
  return Number.isFinite(num) ? num : fallback;
}

export async function POST(req: Request) {
  const sb = createClient();

  const { data: gu } = await sb.auth.getUser();
  const uid = gu?.user?.id;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();

  // sanitize items and compute totals on the server
  const items: Array<{ description?: string; qty?: number; unit_price?: number }> = Array.isArray(body.items) ? body.items : [];
  const safeItems = items.map(it => ({
    description: (it?.description ?? "").toString().slice(0, 200),
    qty: n(it?.qty, 0),
    unit_price: n(it?.unit_price, 0),
  }));
  const subtotal = safeItems.reduce((s, it) => s + it.qty * it.unit_price, 0);
  const vatRate = n(body.vat_rate, 0.15);
  const vat = Math.round(subtotal * vatRate * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  // snapshot seller profile (kept from your code, with safer fallbacks)
  const { data: profiles } = await sb.from("user_profiles").select("*").eq("user_id", uid).limit(1);
  const bp = profiles?.[0];

  const dateVal = (() => {
    const raw = body.date;
    const d = raw ? new Date(raw) : new Date();
    return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
  })();

  const payload = {
    user_id: uid,
    // IMPORTANT: use the same column name your verify endpoint expects (see #2)
    ref: (body.ref || body.reference_number || `REF-${Date.now()}`).toString().slice(0, 80),

    date: dateVal,
    client_name: body.client_name || null,
    client_email: body.client_email || null,
    client_phone: body.client_phone || null,

    items: safeItems,               // JSONB
    subtotal,                       // numeric
    tax: vat,                       // numeric
    total,                          // numeric NOT NULL (now always finite)
    payment_status: (body.payment_status || "PAID").toString().toUpperCase(),

    business_name: bp?.company_name || bp?.full_name || "UPDATE PROFILE",
    brn: bp?.brn || "N/A",
    vat_number: bp?.vat_number ?? null,
    business_address: bp?.address || "No address set",
    business_phone: bp?.phone || "No phone set",
    business_email: bp?.email || "",
    logo_url: bp?.logo_url ?? null,
  };

  const { data, error } = await sb.from("receipts").insert(payload).select("id, ref, total").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, receipt: data });
}
