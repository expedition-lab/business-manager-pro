// middleware.js
import { NextResponse } from 'next/server';

/**
 * Minimal, safe middleware:
 * - Does NOTHING except pass requests through.
 * - IMPORTANT: Matcher excludes /api and static assets so your POSTs work.
 */
export function middleware(_req) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // run on everything EXCEPT api & static files
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)).*)',
  ],
};
