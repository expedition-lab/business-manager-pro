// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
  const sb = createClient(cookies());
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <p>Not signed in</p>;

  return (
    <main style={{ maxWidth: 880, margin: "40px auto", padding: 16 }}>
      <h1>Welcome back, {user.email}</h1>
      <p>You’re now logged in.</p>
    </main>
  );
}
