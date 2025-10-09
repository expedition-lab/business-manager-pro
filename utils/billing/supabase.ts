import { createClient } from "@/utils/supabase/server";

export async function upsertActiveSubscription({ userId, plan, provider }:{
  userId: string; plan: "starter"|"business"|"pro"; provider: "stripe"|"paypal";
}) {
  const sb = createClient();
  await sb.from("subscriptions").upsert({
    user_id: userId, plan_id: plan, provider, status: "active",
    current_period_end: new Date(Date.now()+30*24*3600*1000).toISOString(),
  });
}

export async function saveManualProof({ plan, proofPath }:{ plan:string; proofPath:string }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("No user");
  await sb.from("juice_payments").insert({ user_id: user.id, plan_id: plan, proof_path: proofPath });
  await sb.from("subscriptions").upsert({ user_id: user.id, plan_id: plan, provider: "juice", status: "pending" });
}
