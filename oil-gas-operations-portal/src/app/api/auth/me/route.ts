export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/og_session=([^;]+)/);
  if (!match) {
    return Response.json({ role: 'guest', name: 'Guest', userId: null });
  }
  try {
    const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString());
    if (decoded.exp && decoded.exp < Date.now()) {
      return Response.json({ role: 'guest', name: 'Session Expired', userId: null });
    }
    return Response.json({ role: decoded.role, name: decoded.name, userId: decoded.userId });
  } catch {
    return Response.json({ role: 'guest', name: 'Guest', userId: null });
  }
}
