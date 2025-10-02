// at the very top of EVERY api file
export const config = { runtime: 'edge', regions: ['iad1', 'fra1', 'dub1'] };

export const config = { runtime: 'edge' };
export default function handler() { return new Response('ok', { status: 200 }); }
