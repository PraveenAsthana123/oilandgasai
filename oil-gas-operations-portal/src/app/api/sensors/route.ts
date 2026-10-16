export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stream = searchParams.get('stream');

  try {
    let query = 'SELECT * FROM ogo_sensor WHERE 1=1';
    const params: string[] = [];
    if (stream) { query += ` AND stream = $1`; params.push(stream); }
    query += ' ORDER BY stream, sensor_type';
    const result = await pool.query(query, params);
    return Response.json({ data: result.rows, count: result.rowCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
