// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {
  // do your auth/redirect logic here if needed,
  // or just pass-through:
  return NextResponse.next();
}

// EXCLUDE api and static assets so your POSTs keep working
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map)).*)',
  ],
};
