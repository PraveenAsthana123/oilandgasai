import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Demo users — in production replace with real DB lookup + bcrypt
const DEMO_USERS = [
  { email: 'admin@oilandgas.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'sales@oilandgas.com', password: 'sales123', role: 'sales', name: 'Sales Rep' },
  { email: 'ops@oilandgas.com', password: 'ops123', role: 'operator', name: 'Operator' },
  { email: 'customer@oilandgas.com', password: 'cust123', role: 'customer', name: 'Customer' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const sessionData = Buffer.from(
      JSON.stringify({ userId: email, role: user.role, name: user.name, exp: Date.now() + 86400000 })
    ).toString('base64');
    const response = NextResponse.json({ ok: true, role: user.role, name: user.name });
    response.cookies.set('og_session', sessionData, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
