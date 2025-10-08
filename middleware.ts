// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export const config = {
  matcher: [
    // protect everything except static assets/auth/paywall/billing/api
    "/((?!_next|favicon.ico|robots.txt|sitemap.xml|sitemap.txt|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|html)|auth|paywall|pricing|api/paypal).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL("/auth/login", req.url));

  const { data } = await supabase
    .from("users")
    .select("subscription_status")
    .eq("id", session.user.id)
    .single();

  const path = new URL(req.url).pathname;
  const allow = ["/paywall", "/pricing", "/account/billing"];
  if (data?.subscription_status !== "active" && !allow.includes(path)) {
    return NextResponse.redirect(new URL("/paywall", req.url));
  }
  return res;
}
