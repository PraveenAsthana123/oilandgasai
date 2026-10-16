export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stream = searchParams.get('stream');
  const department = searchParams.get('department');
  const ai_type = searchParams.get('ai_type');

  try {
    let query = 'SELECT * FROM ogo_use_case WHERE 1=1';
    const params: string[] = [];
    let idx = 1;
    if (stream) { query += ` AND stream = $${idx++}`; params.push(stream); }
    if (department) { query += ` AND department ILIKE $${idx++}`; params.push(`%${department}%`); }
    if (ai_type) { query += ` AND ai_type ILIKE $${idx++}`; params.push(`%${ai_type}%`); }
    query += ' ORDER BY stream, department, use_case_name';
    const result = await pool.query(query, params);
    return Response.json({ data: result.rows, count: result.rowCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
