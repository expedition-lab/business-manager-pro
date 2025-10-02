export const config = { runtime: 'nodejs20.x', regions: ['iad1'] };

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const txt = Buffer.concat(chunks).toString('utf8');
  return txt ? JSON.parse(txt) : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const meUrl = process.env.SUPABASE_URL.replace(/\/+$/, '') + '/auth/v1/user';
    const me = await fetch(meUrl, {
      headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());

    if (!me || !me.id) return res.status(401).json({ error: 'Invalid token' });

    const fields = await readJsonBody(req);
    const payload = { id: me.id, email: me.email, subscription_status: 'trial', ...fields };

    const upUrl = process.env.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/users?on_conflict=id';
    const r = await fetch(upUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(text);
  } catch (e) {
    console.error('USERS UPSERT ERROR', e);
    res.status(500).json({ error: e.message || String(e) });
  }
}
