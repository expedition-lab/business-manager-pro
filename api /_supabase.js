import { createClient } from "@supabase/supabase-js";

// Use the ANON key + the caller's JWT (Authorization header)
// so RLS applies per user safely.
export function supabaseAsUser(req) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: req.headers.authorization || "" } } }
  );
}
