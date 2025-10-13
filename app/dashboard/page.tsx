// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type ReceiptRow = {
  id: string;
  reference_number: string | null;
  ref: string | null;
  total: number;
  currency: string | null;
  created_at: string;
  payment_status: string | null;
  client_name: string | null;
};

export default async function DashboardPage() {
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies, headers }
  );

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/auth?next=/dashboard");

  // read receipts
  const { data: receipts = [], error } = await sb
    .from("receipts")
    .select("id, reference_number, ref, total, currency, created_at, payment_status, client_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return <main className="mx-auto max-w-5xl p-6"><h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-red-600 mt-3">Error: {error.message}</p></main>;
  }

  // KPIs
  const count = receipts.length;
  const revenue = receipts.reduce((s, r) => s + Number(r.total || 0), 0);
  const currency = receipts[0]?.currency ?? "MUR";

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <a href="/settings" className="px-3 py-2 rounded-md border">Manage Plan</a>
          <form action="/auth/signout" method="post"><button className="px-3 py-2 rounded-md border">Sign Out</button></form>
        </div>
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">Receipts Created</div>
          <div className="mt-2 text-3xl font-bold">{count}</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold">{currency} {revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="text-sm text-slate-500">Current Plan</div>
          <div className="mt-2 text-3xl font-bold">Trial</div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-xl border bg-white p-5">
        <div className="text-lg font-semibold mb-3">Quick Actions</div>
        <div className="flex gap-3 flex-wrap">
          <a href="/receipts/new" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Create Receipt</a>
          <a href="/reports" className="px-4 py-2 rounded-lg border">View Reports</a>
          <a href="/settings" className="px-4 py-2 rounded-lg border">Settings</a>
        </div>
      </section>

      {/* Recent receipts */}
      <section className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Recent Receipts</div>
          <a className="px-3 py-2 rounded-md border" href="/api/receipts/export.csv">Export CSV</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Client</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Ref</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {receipts.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-2">{r.client_name ?? "—"}</td>
                  <td className="p-2 text-right">{(r.currency ?? "MUR")} {Number(r.total ?? 0).toFixed(2)}</td>
                  <td className="p-2">{r.payment_status ?? "unpaid"}</td>
                  <td className="p-2">{r.reference_number || r.ref || r.id.slice(0,8)}</td>
                  <td className="p-2 text-right">
                    <a className="px-2 py-1 rounded-md border mr-2" href={`/receipts/${r.id}`}>View</a>
                    <a className="px-2 py-1 rounded-md border" href={`/api/receipts/${r.id}/pdf`} rel="noopener">Download PDF</a>
                  </td>
                </tr>
              ))}
              {!receipts.length && (
                <tr><td className="p-3 text-slate-500" colSpan={6}>No receipts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
