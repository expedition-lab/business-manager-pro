import { NextResponse } from "next/server";

// change this string on every deploy to be sure you're seeing new code
const BUILD_MARK = "pdf-v2-installed";

export async function GET() {
  return new NextResponse(JSON.stringify({ ok: true, build: BUILD_MARK, now: new Date().toISOString() }), {
    headers: { "content-type": "application/json" },
  });
}
