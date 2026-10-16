export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stream = searchParams.get('stream');
  const status = searchParams.get('status');
  try {
    let q = 'SELECT * FROM ogs_lead WHERE 1=1';
    const params: any[] = [];
    if (stream) { params.push(stream); q += ` AND stream = $${params.length}`; }
    if (status) { params.push(status); q += ` AND status = $${params.length}`; }
    q += ' ORDER BY created_at DESC';
    const result = await pool.query(q, params);
    return Response.json(result.rows);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { company, contact_name, email, phone, stream, source, score, status, owner } = body;
    const result = await pool.query(
      'INSERT INTO ogs_lead (company, contact_name, email, phone, stream, source, score, status, owner) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [company, contact_name, email, phone, stream, source, score || 0, status || 'new', owner]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
