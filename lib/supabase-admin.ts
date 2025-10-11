import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_KEY!;

if (!url || !service) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
}

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false },
});
