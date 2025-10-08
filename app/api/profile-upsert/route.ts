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

export async function POST(req: NextRequest) {
  const sb = createClient();

  // 0) must be signed in (RLS depends on JWT)
  const { data: gu } = await sb.auth.getUser();
  const user = gu?.user;
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1) parse JSON safely
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 2) normalize & basic validation (keep it light—no external deps)
  const email = clip(sOrNull(body.email) ?? user.email ?? null, MAX.email);
  const full_name = clip(sOrNull(body.full_name), MAX.name);
  const business_name = clip(sOrNull(body.business_name), MAX.name);
  const brn = clip(sOrNull(body.brn), MAX.brn);
  const vat = clip(sOrNull(body.vat), MAX.vat);
  const phone = clip(sOrNull(body.phone), MAX.phone);
  const address = clip(sOrNull(body.address), MAX.address);
  const logo_url = clip(sOrNull(body.logo_url), MAX.url);

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (logo_url && !isHttpUrl(logo_url)) {
    return NextResponse.json({ error: "Logo URL must be http(s)." }, { status: 400 });
  }

  // 3) build RLS-safe payload (⚠️ never send user_id)
  const payload = {
    email,
    full_name,
    business_name,
    brn,
    vat,
    phone,
    address,
    logo_url,
  };

  // 4) upsert idempotently; one row per user via onConflict(user_id)
  //    DB should have: user_id DEFAULT auth.uid(), UNIQUE(user_id)
  try {
    const { data, error } = await sb
      .from("business_profiles")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      // Surface friendly messages (hide raw SQL)
      // Handle common cases explicitly
      const msg =
        error.code === "42501"
          ? "You don't have permission to update this profile."
          : error.code === "23505"
          ? "You already have a profile. Try reloading."
          : "Could not save profile. Please try again.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (e) {
    // Network/client exception (rare)
    return NextResponse.json({ error: "Unexpected error. Please retry." }, { status: 500 });
  }
}
