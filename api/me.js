// at the very top of EVERY api file
export const config = { runtime: 'edge', regions: ['iad1', 'fra1', 'dub1'] };

export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key  = (process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!base || !key) return json({ error: 'Missing env vars' }, 500);

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'No token' }, 401);

  try {
    const r = await fetch(base + '/auth/v1/user', { headers: { apikey: key, Authorization: `Bearer ${token}` } });
    const text = await r.text();
    return new Response(text, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
  } catch (e) {
    return json({ error: e.message || String(e) }, 500);
  }
}
