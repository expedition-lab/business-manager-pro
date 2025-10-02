export default async function handler(req, res) {
  try {
    const url = process.env.SUPABASE_URL;
    const svc = process.env.SUPABASE_SERVICE_KEY;
    const site = process.env.SITE_URL;

    // quick outbound probe (no auth needed)
    let status = 'n/a';
    try {
      const r = await fetch(url.replace(/\/+$/,'') + '/auth/v1/settings');
      status = r.status;
    } catch (e) {
      status = 'fetch-failed: ' + (e.message || e);
    }

    res.status(200).json({
      ok: true,
      has_SUPABASE_URL: !!url,
      has_SERVICE_KEY: !!svc,
      has_SITE_URL: !!site,
      supabase_probe_status: status
    });
  } catch (e) {
    console.error('DIAG ERROR', e);
    res.status(500).json({ ok:false, error: e.message || String(e) });
  }
}
