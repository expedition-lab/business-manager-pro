import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { saveManualProof } from "@/utils/billing/supabase";

export async function POST(req: Request) {
  const form = await req.formData();
  const plan = (form.get("plan") as string) || "starter";
  const file = form.get("proof") as File;
  if (!file) return NextResponse.json({ error:"No file" }, { status:400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const key = `proofs/${Date.now()}-${file.name}`;
  const { error } = await supabaseAdmin.storage.from("billing").upload(key, buf, { contentType: file.type });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await saveManualProof({ plan, proofPath: key });
  return NextResponse.redirect(new URL("/billing/pending", process.env.NEXT_PUBLIC_BASE_URL));
}
