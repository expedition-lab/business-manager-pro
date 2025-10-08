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

function noStore(json: any, init?: number | ResponseInit) {
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
    .from("business_profiles")
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
  const business_name = clip(sOrNull(body.business_name), MAX.name);
  const brn = clip(sOrNull(body.brn), MAX.brn);
  const vat = clip(sOrNull(body.vat), MAX.vat);
  const phone = clip(sOrNull(body.phone), MAX.phone);
  const address = clip(sOrNull(body.address), MAX.address);
  const logo_url = clip(sOrNull(body.logo_url), MAX.url);

  if (!isEmail(email)) return noStore({ error: "Please enter a valid email address." }, { status: 400 });
  if (logo_url && !isHttpUrl(logo_url)) return noStore({ error: "Logo URL must be http(s)." }, { status: 400 });

  const payload = { email, full_name, business_name, brn, vat, phone, address, logo_url };

  try {
    // check if a row already exists (to choose 201 vs 200 and avoid no-op writes)
    const { data: existing } = await sb
      .from("business_profiles")
      .select("email, full_name, business_name, brn, vat, phone, address, logo_url")
      .eq("user_id", user.id)
      .single();

    const isNoop =
      existing &&
      existing.email === payload.email &&
      existing.full_name === payload.full_name &&
      existing.business_name === payload.business_name &&
      existing.brn === payload.brn &&
      existing.vat === payload.vat &&
      existing.phone === payload.phone &&
      existing.address === payload.address &&
      existing.logo_url === payload.logo_url;

    if (isNoop) return noStore({ profile: existing, unchanged: true }, { status: 200 });

    const { data, error } = await sb
      .from("business_profiles")
      .upsert(payload, { onConflict: "user_id" }) // user_id DEFAULT auth.uid()
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
