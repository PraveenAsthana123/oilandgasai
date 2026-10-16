export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_activity ORDER BY ts DESC LIMIT 100');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, subject, notes, related_id, related_type, user_id } = body;
    const result = await pool.query(
      'INSERT INTO ogs_activity (type, subject, notes, related_id, related_type, user_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [type, subject, notes, related_id || null, related_type, user_id]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
