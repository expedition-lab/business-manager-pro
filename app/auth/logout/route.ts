// app/auth/logout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await sb.auth.signOut();
  return NextResponse.redirect(new URL("/auth", process.env.NEXT_PUBLIC_BASE_URL));
}
