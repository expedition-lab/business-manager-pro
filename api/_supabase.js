import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // SERVER ONLY

if (!url || !serviceKey) {
  console.warn("[supabase] Missing env vars SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false }
});
