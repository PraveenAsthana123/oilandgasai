export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_quote ORDER BY created_at DESC');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { opportunity_id, amount_cad, line_items, status, expires_at } = body;
    const result = await pool.query(
      'INSERT INTO ogs_quote (opportunity_id, amount_cad, line_items, status, expires_at) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [opportunity_id, amount_cad, JSON.stringify(line_items || []), status || 'draft', expires_at]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
