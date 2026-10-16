export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM ogcu_audit_log ORDER BY ts DESC LIMIT 100');
    return Response.json({ logs: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
