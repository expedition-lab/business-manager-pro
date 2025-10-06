"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const sb = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;

    const origin = window.location.origin;
    const emailRedirectTo = `${origin}/auth/callback?next=/app`; // <- where to land after login

    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo }, // IMPORTANT
    });

    if (!error) setCooldown(60); // prevent “49s” spam
    else alert(error.message);
  }

  // simple cooldown timer
  if (cooldown > 0) setTimeout(() => setCooldown(cooldown - 1), 1000);

  return (
    <form onSubmit={handleSignIn}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      <button disabled={cooldown > 0} type="submit">
        {cooldown > 0 ? `Wait ${cooldown}s` : "Send login link"}
      </button>
    </form>
  );
}
