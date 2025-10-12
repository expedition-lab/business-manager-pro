// utils/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Standard server-side Supabase client (anon).
 * Use this for typical RLS-protected queries in route handlers.
 */
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(url, anon, { auth: { persistSession: false } });
}

/** Convenience default export (some codebases import default) */
const supabaseServer = getServerSupabase();
export default supabaseServer;
