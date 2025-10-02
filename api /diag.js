export const config = { runtime: 'nodejs' };

export default async function handler(req, res){
  try{
    const base=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
    const key =(process.env.SUPABASE_SERVICE_KEY||'').trim();
    const urlOk=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base);
    let probe='n/a';
    try{
      if(!urlOk) throw new Error('invalid-supabase-url');
      const r=await fetch(base + '/auth/v1/settings',{ headers:{ apikey:key }});
      probe=String(r.status);
    }catch(e){ probe='fetch-failed: ' + (e.message || String(e)); }
    res.status(200).json({
      runtime:'node',
      supabase_url_echo:base,
      supabase_url_valid:urlOk,
      SERVICE_KEY_shape: key ? (key.startsWith('sb_')?'sb_secret_*':'other') : 'missing',
      supabase_probe_status: probe
    });
  }catch(e){ res.status(500).json({ ok:false, error:e.message||String(e) }); }
}
