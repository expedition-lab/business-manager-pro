// app/api/_lib/supabase-admin.ts
export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,                 // or NEXT_PUBLIC_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!     // renamed var
);
