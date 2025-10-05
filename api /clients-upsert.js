import { supabaseAsUser } from "./_supabase";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = supabaseAsUser(req);
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return res.status(401).json({ error: "Not authenticated" });

  const b = typeof req.body === "string" ? JSON.parse(req.body||"{}") : (req.body||{});
  const row = {
    user_id: user.id,
    contact_name: b.contact_name || null,
    contact_email: b.contact_email || null,
    contact_phone: b.contact_phone || null,
    company_name: b.company_name || null,
    company_brn: b.company_brn || null,
    company_address: b.company_address || null
  };

  const { data, error } = await supabase.from("clients")
    .insert(row)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ ok: true, client: data });
}
