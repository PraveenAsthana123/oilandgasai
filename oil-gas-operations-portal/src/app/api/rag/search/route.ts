export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? '';
  const dept = url.searchParams.get('dept') ?? '';

  if (!q.trim()) return Response.json({ results: [], total: 0 });

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (
      id SERIAL PRIMARY KEY, source TEXT, chunk_text TEXT,
      chunk_index INT, dept_tag TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    // Build search query — tokenize the query and use ILIKE on each word
    const words = q.trim().split(/\s+/).slice(0, 6);
    const conditions = words.map((_, i) => `chunk_text ILIKE $${i + 1}`).join(' AND ');
    const values = words.map(w => `%${w}%`);

    let sql = `SELECT id, source, chunk_text, chunk_index, dept_tag, created_at FROM ogo_rag_chunk`;
    if (conditions) sql += ` WHERE (${conditions})`;
    if (dept) {
      sql += conditions ? ` AND dept_tag = $${values.length + 1}` : ` WHERE dept_tag = $1`;
      if (dept) values.push(dept);
    }
    sql += ' ORDER BY id LIMIT 10';

    const result = await pool.query(sql, values);

    // Stats
    const stats = await pool.query(
      'SELECT COUNT(*) as total_chunks, COUNT(DISTINCT source) as total_docs, MAX(created_at) as last_updated FROM ogo_rag_chunk'
    );

    const deptStats = await pool.query(
      'SELECT dept_tag, COUNT(*) as chunk_count FROM ogo_rag_chunk GROUP BY dept_tag ORDER BY chunk_count DESC'
    );

    return Response.json({
      results: result.rows,
      total: result.rowCount,
      stats: stats.rows[0],
      dept_coverage: deptStats.rows,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
