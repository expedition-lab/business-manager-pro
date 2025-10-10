// app/pricing/page.tsx  (plans)
'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default function Pricing() {
  const r = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function go(plan: string) {
    const next = `/app/checkout?plan=${plan}`;
    // check session
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      r.push(next);
    } else {
      localStorage.setItem('next', next);
      r.push(`/auth?next=${encodeURIComponent(next)}`);
    }
  }

  return (
    <>
      <button onClick={() => go('starter')}>Get Starter</button>
      <button onClick={() => go('business')}>Get Business</button>
    </>
  );
}
