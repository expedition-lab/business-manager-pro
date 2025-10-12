// utils/supabase/server-auth.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with elevated key if available.
 * Uses SERVICE_ROLE on server, falls back to ANON for safety.
 * No session persistence (perfect for route handlers).
 */
export function getServerSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and key (SERVICE_ROLE or ANON)"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export default getServerSupabaseAuth;
