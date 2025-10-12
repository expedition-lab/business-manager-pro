// app/api/profile-upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/** ---------- tiny helpers ---------- */
const MAX = {
  name: 120,
  brn: 64,
  vat: 64,
  phone: 64,
  address: 500,
  url: 1024,
  email: 255,
};

function s(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}
function sOrNull(v: unknown) {
  const t = s(v);
  return t === "" ? null : t;
}
function clip(v: string | null, n: number) {
  if (v == null) return v;
  return v.length > n ? v.slice(0, n) : v;
}
function isEmail(v: string | null) {
  return v ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : true;
}
function isHttpUrl(v: string | null) {
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function noStore(json: any, init?: ResponseInit) {
  const res = NextResponse.json(json, init);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return res;
}

/** ---------- GET: fetch current user's profile ---------- */
export async function GET() {
  const sb = createClient();
  const { data: gu } = await sb.auth.getUser();
  const user = gu?.user;
  if (!user) return noStore({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await sb
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows; treat as not found
    return noStore({ error: "Could not load profile" }, { status: 400 });
  }
  if (!data) return noStore({ profile: null });

  return noStore({ profile: data });
}

/** ---------- POST: create/update the profile (RLS-safe) ---------- */
export async function POST(req: NextRequest) {
  const sb = createClient();

  // must be signed in (RLS depends on JWT)
  const { data: gu } = await sb.auth.getUser();
  const user = gu?.user;
  if (!user) return noStore({ error: "Not authenticated" }, { status: 401 });

  // parse JSON safely
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return noStore({ error: "Invalid JSON body" }, { status: 400 });
  }

  // normalize & validate
  const email = clip(sOrNull(body.email) ?? user.email ?? null, MAX.email);
  const full_name = clip(sOrNull(body.full_name), MAX.name);
  const company_name = clip(sOrNull(body.company_name || body.business_name), MAX.name);
  const brn = clip(sOrNull(body.brn), MAX.brn);
  const vat = clip(sOrNull(body.vat), MAX.vat);
  const phone = clip(sOrNull(body.phone), MAX.phone);
  const address = clip(sOrNull(body.address), MAX.address);

  if (!isEmail(email)) return noStore({ error: "Please enter a valid email address." }, { status: 400 });

  const payload = { 
    user_id: user.id,
    email, 
    full_name, 
    company_name, 
    brn, 
    vat, 
    phone, 
    address,
    currency: body.currency || "MUR",
    plan: body.plan || "trial"
  };

  try {
    // check if a row already exists (to choose 201 vs 200 and avoid no-op writes)
    const { data: existing } = await sb
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const isNoop =
      existing &&
      existing.email === payload.email &&
      existing.full_name === payload.full_name &&
      existing.company_name === payload.company_name &&
      existing.brn === payload.brn &&
      existing.vat === payload.vat &&
      existing.phone === payload.phone &&
      existing.address === payload.address;

    if (isNoop) return noStore({ profile: existing, unchanged: true }, { status: 200 });

    const { data, error } = await sb
      .from("user_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      const msg =
        error.code === "42501"
          ? "You don't have permission to update this profile."
          : error.code === "23505"
          ? "You already have a profile. Try reloading."
          : "Could not save profile. Please try again.";
      return noStore({ error: msg }, { status: 400 });
    }

    // return 201 on first create, 200 on update
    const status = existing ? 200 : 201;
    return noStore({ profile: data }, { status });
  } catch {
    return noStore({ error: "Unexpected error. Please retry." }, { status: 500 });
  }
}
