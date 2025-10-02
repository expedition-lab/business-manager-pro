// api/diag.js
export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' }
  });

export default async function handler(req) {
  try {
    const base = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const key  = (process.env.SUPABASE_SERVICE_KEY || '').trim();
    const site = (process.env.SITE_URL || '').trim();

    // Basic URL sanity (must start with https:// and contain .supabase.co)
    const urlValid = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base);

    // Try simple auth settings probe
    let probe = 'n/a';
    try {
      if (!urlValid) throw new Error('invalid-supabase-url');
      const r = await fetch(base + '/auth/v1/settings', { headers: { apikey: key } });
      probe = String(r.status);
    } catch (e) {
      probe = 'fetch-failed: ' + (e.message || String(e));
    }

    // Echo some env/state for fast debugging
    const regionHdr = req.headers.get('x-vercel-id') || '';
    const region = regionHdr.includes('::') ? regionHdr.split('::')[0] : regionHdr;

    return json({
      ok: true,
      now: new Date().toISOString(),
      runtime: 'edge',
      region_hint: region,                 // e.g. 'sfo1::abc123'
      has_SUPABASE_URL: !!base,
      has_SERVICE_KEY: !!key,
      has_SITE_URL: !!site,
      supabase_url_echo: base,
      supabase_url_valid: urlValid,
      supabase_probe_status: probe
    });
  } catch (e) {
    return json({ ok: false, error: e.message || String(e) }, 500);
  }
}
