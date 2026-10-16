export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ogs_contract ORDER BY created_at DESC');
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { company, contract_type, value_cad, start_date, end_date, status } = body;
    const result = await pool.query(
      'INSERT INTO ogs_contract (company, contract_type, value_cad, start_date, end_date, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [company, contract_type, value_cad, start_date, end_date, status || 'draft']
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
