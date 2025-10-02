import { readJsonBody, requireEnv } from './_util';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireEnv(res, ['SUPABASE_URL','SUPABASE_SERVICE_KEY'])) return;

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const me = await fetch(`${process.env.SUPABASE_URL.replace(/\/+$/,'')}/auth/v1/user`, {
      headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());

    if (!me || !me.id) return res.status(401).json({ error: 'Invalid token' });

    const fields = await readJsonBody(req);
    const payload = { id: me.id, email: me.email, subscription_status: 'trial', ...fields };

    const r = await fetch(`${process.env.SUPABASE_URL.replace(/\/+$/,'')}/rest/v1/users?on_conflict=id`, {
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
