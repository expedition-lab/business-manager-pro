export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  const me = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());

  if (!me || !me.id) return res.status(401).json({ error: 'Invalid token' });

  const rec = req.body || {};
  rec.user_id = me.id;

  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/receipts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(rec)
  });

  const body = await r.text();
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(body);
}
