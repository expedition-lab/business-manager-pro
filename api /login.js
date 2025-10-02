export const config = { runtime: 'nodejs' };

async function readJsonBody(req){
  if (req.body && typeof req.body === 'object') return req.body;
  const bufs=[]; for await (const c of req) bufs.push(c);
  const t=Buffer.concat(bufs).toString('utf8'); return t?JSON.parse(t):{};
}

export default async function handler(req,res){
  try{
    if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
    const base=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
    const key =(process.env.SUPABASE_SERVICE_KEY||'').trim();
    const { email, password } = await readJsonBody(req);

    const r = await fetch(base + '/auth/v1/token?grant_type=password', {
      method:'POST',
      headers:{ 'content-type':'application/json', apikey:key },
      body: JSON.stringify({ email, password })
    });

    const text=await r.text();
    res.status(r.status).setHeader('content-type', r.headers.get('content-type')||'application/json').send(text);
  }catch(e){ res.status(500).json({error:e.message||String(e)}); }
}
