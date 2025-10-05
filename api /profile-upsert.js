import { supabaseAsUser } from "./_supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = supabaseAsUser(req);

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return res.status(401).json({ error: "Not authenticated" });

  const body = JSON.parse(req.body || "{}");
  const row = {
    user_id: user.id,
    email: body.email,
    full_name: body.full_name,
    business_name: body.business_name,
    brn: body.brn,
    phone: body.phone,
    address: body.address,
    vat: body.vat || null,
    company_type: body.company_type || null,
  };

  const { data, error } = await supabase
    .from("business_profiles")
    .upsert(row, { onConflict: "user_id" })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ ok: true, profile: data });
}
