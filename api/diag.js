// at the very top of EVERY api file
export const config = { runtime: 'edge', regions: ['iad1', 'fra1', 'dub1'] };
export const config = { runtime: 'edge' };
const json = (o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
export default async function handler(req){
  const base=(process.env.SUPABASE_URL||'').trim().replace(/\/+$/,'');
  const key =(process.env.SUPABASE_SERVICE_KEY||'').trim();

  const shape = v => v ? (v.startsWith('sb_') ? 'sb_secret_*' : (v.startsWith('eyJ') ? 'jwt_*' : 'other')) : 'missing';
  const urlOk = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base);

  let probe='n/a';
  try{
    if(!urlOk) throw new Error('invalid-supabase-url');
    const r = await fetch(base + '/auth/v1/settings', { headers: { apikey: key } });
    probe = String(r.status);
  }catch(e){ probe = 'fetch-failed: ' + (e.message || String(e)); }

  return json({
    runtime:'edge',
    supabase_url_echo: base,
    supabase_url_valid: urlOk,
    SERVICE_KEY_shape: shape(key),     // expect "sb_secret_*"
    supabase_probe_status: probe       // expect "200"
  });
}
