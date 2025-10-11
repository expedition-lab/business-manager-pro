// lib/ensureUserProfile.ts
"use client";
import { supabase } from "@/lib/supabase-browser";

export type ProfileForm = {
  full_name?: string;
  phone?: string;
  brn?: string;
  address?: string;
  vat?: string | null;
};

export async function ensureUserProfile(form: ProfileForm) {
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr) throw uerr;
  if (!user) throw new Error("Not signed in");

  const payload = {
    user_id: user.id,
    email: user.email ?? "",
    full_name: (form.full_name || "").trim(),
    phone: (form.phone || "N/A").trim(),    // avoid NOT NULL
    brn: (form.brn || "").trim(),
    address: (form.address || "").trim(),
    vat: form.vat?.trim?.() || null,
  };

  const { error } = await supabase
    .from("user_profiles")                  // or "business_profiles" if that’s your table
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}
