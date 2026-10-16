export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT sr.*, cu.company FROM ogcu_service_request sr
      JOIN ogcu_customer cu ON cu.id = sr.customer_id
      ORDER BY sr.created_at DESC
    `);
    return Response.json({ requests: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_id = 1, request_type, subject, description, priority = 'medium' } = body;
    const { rows } = await pool.query(
      `INSERT INTO ogcu_service_request (customer_id, request_type, subject, description, priority)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, request_type, subject, description, priority]
    );
    return Response.json({ request: rows[0] }, { status: 201 });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
