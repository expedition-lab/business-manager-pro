export const config = { runtime: 'edge' };
export default function handler(){ return new Response('ok', { status: 200 }); }
