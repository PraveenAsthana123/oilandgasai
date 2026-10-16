export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM ogcu_support_ticket ORDER BY created_at DESC LIMIT 50'
    );
    return Response.json({ tickets: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { customer_id = 1, subject, body } = await req.json();
    const { rows } = await pool.query(
      `INSERT INTO ogcu_support_ticket (customer_id, subject, body) VALUES ($1, $2, $3) RETURNING *`,
      [customer_id, subject, body]
    );
    return Response.json({ ticket: rows[0] }, { status: 201 });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
