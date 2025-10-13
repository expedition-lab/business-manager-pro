// app/api/receipts/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function n(val: unknown, fallback = 0) {
  const s = typeof val === "string" ? val.trim() : val;
  const v = Number(s);
  return Number.isFinite(v) ? v : fallback;
}

export async function POST(req: Request) {
  const sb = createClient();

  // auth
  const { data: gu } = await sb.auth.getUser();
  const uid = gu?.user?.id;
  if (!uid) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // body
  const body = await req.json();

  // items → sanitize + compute
  const itemsIn: Array<{ description?: string; qty?: number; unit_price?: number }> =
    Array.isArray(body.items) ? body.items : [];

  const items = itemsIn.map((it) => ({
    description: (it?.description ?? "").toString().slice(0, 200),
    qty: n(it?.qty, 0),
    unit_price: n(it?.unit_price, 0),
  }));

  const subtotal = items.reduce((s, it) => s + it.qty * it.unit_price, 0);
  const vatRate = n(body.vat_rate, 0.15);
  const tax = Math.round(subtotal * vatRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  // seller snapshot (user_profiles exists in your schema)
  const { data: profiles } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", uid)
    .limit(1);
  const bp = profiles?.[0];

  // dates
  const dateVal = (() => {
    const raw = body.date;
    const d = raw ? new Date(raw) : new Date();
    return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
  })();

  // reference number: write BOTH columns to match your DB
  const reference_number = (body.reference_number || body.ref || `REF-${Date.now()}`)
    .toString()
    .slice(0, 80);

  const payload = {
    user_id: uid,

    // 🔴 required in your schema
    reference_number,          // NOT NULL
    // optional convenience:
    ref: reference_number,     // keep both in sync

    date: dateVal,

    client_name: body.client_name || null,
    client_email: body.client_email || null,
    client_phone: body.client_phone || null,

    items,                     // jsonb
    subtotal,                  // numeric
    tax,                       // numeric
    total,                     // numeric, NOT NULL-safe
    payment_status: (body.payment_status || "unpaid").toString().toLowerCase(),

    // seller snapshot (safe fallbacks)
    business_name: bp?.company_name || bp?.full_name || "UPDATE PROFILE",
    brn: bp?.brn || null,
    vat_number: bp?.vat || null,
    business_address: bp?.address || null,
    business_phone: bp?.phone || null,
    business_email: bp?.email || null,
    logo_url: bp?.logo_url ?? null,

    currency: bp?.currency || "MUR",
  };

  const { data, error } = await sb
    .from("receipts")
    .insert(payload)
    .select("id, reference_number, ref, total")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, receipt: data });
}
