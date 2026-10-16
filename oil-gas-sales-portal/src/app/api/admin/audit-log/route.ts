export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_audit_log ORDER BY ts DESC LIMIT 100');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, action, record_type, record_id, details } = body;
    const result = await pool.query(
      'INSERT INTO ogs_audit_log (user_id, action, record_type, record_id, details) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [user_id, action, record_type, record_id, JSON.stringify(details || {})]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
