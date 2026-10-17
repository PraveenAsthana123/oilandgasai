export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { query, dept, limit = 5 } = await req.json();
  const client = await pool.connect();
  try {
    const res = await client.query(
      `SELECT id AS chunk_id, dept, content, source,
              CASE WHEN content ILIKE $1 THEN 1.0 ELSE 0.5 END AS similarity
       FROM ogo_rag_chunk
       WHERE dept ILIKE $2 AND content ILIKE $1
       ORDER BY similarity DESC
       LIMIT $3`,
      [`%${query}%`, `%${dept ?? 'pipeline-integrity'}%`, limit]
    );

    if (res.rows.length === 0) {
      const fallback = await client.query(
        `SELECT id AS chunk_id, dept, content, source, 0.3 AS similarity
         FROM ogo_rag_chunk WHERE dept ILIKE $1 ORDER BY id LIMIT $2`,
        [`%${dept ?? 'pipeline-integrity'}%`, limit]
      );
      return NextResponse.json({ results: fallback.rows });
    }

    return NextResponse.json({ results: res.rows });
  } catch (e: unknown) {
    return NextResponse.json({ results: [], error: String(e) });
  } finally {
    client.release();
  }
}
