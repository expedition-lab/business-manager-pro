// lib/ensureUserProfile.ts
"use client";
import { supabase } from "@/lib/supabase-browser";

export type ProfileForm = {
  full_name?: string;
  business_name?: string;
  phone?: string;
  brn?: string;
  address?: string;
  vat?: string | null;
};

export async function ensureUserProfile(form: ProfileForm = {}) {
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr) throw uerr;
  if (!user) throw new Error("Not signed in");

  // Create profile with placeholders if fields not provided
  const payload = {
    user_id: user.id,
    email: user.email ?? "",
    full_name: (form.full_name || "").trim() || "Not set",
    company_name: (form.business_name || "").trim() || "Not set - Please update in Settings",
    phone: (form.phone || "").trim() || "Not set",
    brn: (form.brn || "").trim() || "Not set",
    address: (form.address || "").trim() || "Not set - Please update in Settings",
    vat: form.vat?.trim?.() || null,
  };

  // FIXED: Changed from "business_profiles" to "user_profiles"
  const { error } = await supabase
    .from("user_profiles")  // ✅ CORRECT TABLE NAME
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;
}
