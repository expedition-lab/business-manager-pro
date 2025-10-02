export const config = { runtime: 'edge' };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  try {
    const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const svc = (process.env.SUPABASE_SERVICE_KEY || '').trim();
    const site = (process.env.SITE_URL || '').trim();

    let probe = 'n/a';
    try {
      const r = await fetch(url + '/auth/v1/settings', { headers: { apikey: svc } });
      probe = String(r.status);
    } catch (e) {
      probe = 'fetch-failed: ' + (e.message || String(e));
    }

    return json({
      ok: true,
      has_SUPABASE_URL: !!url,
      has_SERVICE_KEY: !!svc,
      has_SITE_URL: !!site,
      supabase_probe_status: probe,
      supabase_url_echo: url
    });
  } catch (e) {
    return json({ ok: false, error: e.message || String(e) }, 500);
  }
}
