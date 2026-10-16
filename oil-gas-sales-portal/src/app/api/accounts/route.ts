export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_account ORDER BY revenue_cad DESC');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { company, stream, revenue_cad, credit_limit_cad, payment_terms, health_score } = body;
    const result = await pool.query(
      'INSERT INTO ogs_account (company, stream, revenue_cad, credit_limit_cad, payment_terms, health_score) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [company, stream, revenue_cad || 0, credit_limit_cad, payment_terms || 'Net 30', health_score || 50]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
