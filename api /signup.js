export const config = { runtime: 'nodejs' };

async function readJsonBody(req){
  if (req.body && typeof req.body === 'object') return req.body;
  const bufs=[]; for await (const c of req) bufs.push(c);
  const t=Buffer.concat(bufs).toString('utf8'); return t?JSON.parse(t):{};
}

export default async function handler(req, res){
  try{
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/,'');
    // accept either env name so we don't get "Missing env vars"
    const key  = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const site = (process.env.SITE_URL || '').trim();
    if (!base || !key || !site) return res.status(500).json({ error: 'Missing env vars' });

    const { email, password, data } = await readJsonBody(req);
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    // Admin create (immediate confirmation, no SMTP hassle)
    const r = await fetch(base + '/auth/v1/admin/users', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: key,
        authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: data || {}
      })
    });

    const text = await r.text();
    res.status(r.status).setHeader(
      'content-type', r.headers.get('content-type') || 'application/json'
    ).send(text);
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
