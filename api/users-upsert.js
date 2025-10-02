export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'No token' });

  // who is this user?
  const me = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': process.env.SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());

  if (!me || !me.id) return res.status(401).json({ error: 'Invalid token' });

  const fields = req.body || {};
  const payload = { id: me.id, email: me.email, subscription_status: 'trial', ...fields };

  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users?on_conflict=id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(payload)
  });

  const body = await r.text();
  res.status(r.status).setHeader('Content-Type', r.headers.get('content-type') || 'application/json').send(body);
}
