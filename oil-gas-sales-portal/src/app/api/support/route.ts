export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_support_ticket ORDER BY created_at DESC LIMIT 50');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, subject, body: ticketBody } = body;
    const result = await pool.query(
      'INSERT INTO ogs_support_ticket (user_id, subject, body) VALUES ($1,$2,$3) RETURNING *',
      [user_id || 'anonymous', subject, ticketBody]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
