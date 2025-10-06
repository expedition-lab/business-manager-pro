export const config = { runtime: "nodejs" };

// Read JSON body on Vercel/Node
async function readJsonBody(req: any) {
  if (req.body && typeof req.body === "object") return req.body;
  const bufs: Buffer[] = [];
  for await (const c of req) bufs.push(c as Buffer);
  const t = Buffer.concat(bufs).toString("utf8");
  return t ? JSON.parse(t) : {};
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // ✅ Use the standard Supabase envs
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

    if (!base || !anon) {
      return res.status(500).json({ error: "Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)" });
    }

    // ✅ Require user JWT from client
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) {
      return res.status(401).json({ error: "Missing Authorization Bearer token" });
    }

    // ✅ Verify token with anon key (so auth.uid() is available for RLS)
    const meResp = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: anon, authorization: `Bearer ${token}` }
    });
    if (!meResp.ok) {
      const txt = await meResp.text();
      return res.status(401).json({ error: `Invalid token (${meResp.status}) ${txt}` });
    }
    const me = await meResp.json();

    // ✅ Prepare payload
    const payload = await readJsonBody(req);
    payload.user_id = me.id;                 // required for policy check
    payload.items   = payload.items ?? [];   // keep a consistent shape

    // ✅ Insert with USER token (RLS enforced)
    const ins = await fetch(`${base}/rest/v1/receipts?select=*`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: anon,
        authorization: `Bearer ${token}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const bodyTxt = await ins.text();
    let json: any = null;
    try { json = bodyTxt ? JSON.parse(bodyTxt) : null; } catch { /* noop */ }

    if (!ins.ok) {
      const message = (json && (json.message || json.hint || json.details)) || bodyTxt || `HTTP ${ins.status}`;
      return res.status(ins.status).json({ error: message });
    }

    const receipt = Array.isArray(json) ? json[0] : json;
    return res.status(200).json({ ok: true, receipt });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
