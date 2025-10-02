export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key  = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!base || !key) return json({ error: 'Missing env vars' }, 500);

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'No token' }, 401);

  try {
    const me = await fetch(base + '/auth/v1/user', { headers: { apikey: key, Authorization: `Bearer ${token}` } }).then(r => r.json());
    if (!me || !me.id) return json({ error: 'Invalid token' }, 401);

    const fields = await req.json();
    const payload = { id: me.id, email: me.email, subscription_status: 'trial', ...fields };

    const r = await fetch(base + '/rest/v1/users?on_conflict=id', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    return new Response(text, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
  } catch (e) {
    return json({ error: e.message || String(e) }, 500);
  }
}
