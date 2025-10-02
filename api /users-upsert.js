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

    const auth=req.headers.authorization||'';
    const token=auth.startsWith('Bearer ')?auth.slice(7):'';
    const me=await fetch(base+'/auth/v1/user',{ headers:{ apikey:key, authorization:`Bearer ${token}` }})
      .then(r=>r.json()).catch(()=>null);
    if(!me||!me.id) return res.status(401).json({error:'Invalid token'});

    const fields=await readJsonBody(req);
    const payload={ id: me.id, email: me.email, subscription_status:'trial', ...fields };

    const r=await fetch(base+'/rest/v1/users?on_conflict=id',{
      method:'POST',
      headers:{
        'content-type':'application/json',
        apikey:key,
        authorization:`Bearer ${key}`,
        Prefer:'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });

    const t=await r.text();
    res.status(r.status).setHeader('content-type', r.headers.get('content-type')||'application/json').send(t);
  }catch(e){ res.status(500).json({error:e.message||String(e)}); }
}
