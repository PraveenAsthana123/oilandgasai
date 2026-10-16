export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM ogcu_lead ORDER BY score DESC');
    return Response.json({ leads: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
