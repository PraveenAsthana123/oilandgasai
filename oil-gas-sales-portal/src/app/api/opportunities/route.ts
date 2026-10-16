export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_opportunity ORDER BY created_at DESC');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lead_id, title, value_cad, stream, product, stage, probability, close_date, notes } = body;
    const result = await pool.query(
      'INSERT INTO ogs_opportunity (lead_id, title, value_cad, stream, product, stage, probability, close_date, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [lead_id, title, value_cad, stream, product, stage || 'prospect', probability || 10, close_date, notes]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
