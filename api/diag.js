export const config = { runtime: 'nodejs20.x', regions: ['iad1'] };

export default async function handler(req, res) {
  try {
    const url  = process.env.SUPABASE_URL || '';
    const svc  = process.env.SUPABASE_SERVICE_KEY || '';
    const site = process.env.SITE_URL || '';

    let probe = 'n/a';
    try {
      const r = await fetch(url.replace(/\/+$/, '') + '/auth/v1/settings', {
        headers: { apikey: svc }
      });
      probe = String(r.status);
    } catch (e) {
      probe = 'fetch-failed: ' + (e.message || e);
    }

    res.status(200).json({
      ok: true,
      has_SUPABASE_URL: !!url,
      has_SERVICE_KEY:  !!svc,
      has_SITE_URL:     !!site,
      supabase_probe_status: probe
    });
  } catch (e) {
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
}
