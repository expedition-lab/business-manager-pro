// utils/billing/supabase.ts
import { getServerSupabase } from "@/utils/supabase/server";

/**
 * Optional helper used by billing flows to store Stripe IDs.
 * This is a safe no-op if your `profiles` table doesn't have the column yet.
 */
export async function attachStripeCustomerId(
  userId: string,
  stripeCustomerId: string
) {
  try {
    const supabase = getServerSupabase();
    // If your table/column exists, this will work.
    // If not, it's swallowed so builds don’t break.
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("user_id", userId);
  } catch {
    // ignore to keep build/runtime resilient
  }
}

