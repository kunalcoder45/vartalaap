// middleware.ts (in root or /app if using App Router)
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Rate-limit manifest requests manually
  if (req.nextUrl.pathname === '/manifest.json') {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'public, max-age=3600');
    return res;
  }

  return NextResponse.next();
}
