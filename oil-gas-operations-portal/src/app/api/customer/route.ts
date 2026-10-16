export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const tickets = await pool.query('SELECT * FROM ogo_support_ticket ORDER BY created_at DESC LIMIT 20');
    return Response.json({ tickets: tickets.rows, count: tickets.rowCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, subject, body: ticketBody } = body;
    const result = await pool.query(
      'INSERT INTO ogo_support_ticket (user_id,subject,body) VALUES ($1,$2,$3) RETURNING *',
      [user_id, subject, ticketBody]
    );
    return Response.json({ data: result.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
