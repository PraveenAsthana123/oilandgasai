export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const [leads, opps] = await Promise.all([
      pool.query('SELECT * FROM ogo_lead ORDER BY created_at DESC LIMIT 50'),
      pool.query('SELECT * FROM ogo_opportunity ORDER BY created_at DESC LIMIT 50'),
    ]);
    const pipeline_value = opps.rows.reduce((sum: number, o: { value: string }) => sum + parseFloat(o.value || '0'), 0);
    return Response.json({ leads: leads.rows, opportunities: opps.rows, pipeline_value });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, company, email, phone, source } = body;
    const result = await pool.query(
      'INSERT INTO ogo_lead (name,company,email,phone,source) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, company, email, phone, source]
    );
    return Response.json({ data: result.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
