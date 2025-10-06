export const config = { runtime: "nodejs" };

// small body reader for Vercel
async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const bufs = []; for await (const c of req) bufs.push(c);
  const t = Buffer.concat(bufs).toString("utf8"); return t ? JSON.parse(t) : {};
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const base = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const svc  = (process.env.SUPABASE_SERVICE_KEY || "").trim();
    if (!base || !svc) return res.status(500).json({ error: "Supabase env missing" });

    // verify user JWT (so RLS applies correctly)
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const me = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: svc, authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null).catch(() => null);
    if (!me?.id) return res.status(401).json({ error: "Invalid token" });

    const payload = await readJsonBody(req);
    payload.user_id = me.id;               // required by RLS & trigger
    payload.items   = payload.items ?? []; // default shape

    const ins = await fetch(`${base}/rest/v1/receipts?select=*`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: svc,
        authorization: `Bearer ${svc}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const txt = await ins.text();
    let rows = [];
    try { rows = txt ? JSON.parse(txt) : []; } catch { /* ignore */ }

    // If trigger complains (no profile), PostgREST returns 400 with message
    if (!ins.ok) {
      const err = rows?.message || rows?.hint || txt || `HTTP ${ins.status}`;
      return res.status(ins.status).json({ error: err });
    }

    const receipt = Array.isArray(rows) ? rows[0] : rows;
    return res.status(200).json({ ok: true, receipt });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
}
