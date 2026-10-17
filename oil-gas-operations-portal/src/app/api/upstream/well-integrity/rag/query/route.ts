import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  try {
    const tc = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_rag_chunk') AS exists`);
    if (!tc.rows[0].exists) return NextResponse.json({ chunks: [] });
    const kw = (query as string).split(/\s+/).filter(w => w.length > 3).slice(0, 4);
    if (kw.length === 0) return NextResponse.json({ chunks: [] });
    const lc = kw.map((_, i) => `content ILIKE $${i + 2}`).join(' OR ');
    const { rows } = await pool.query(`SELECT id, content, source_doc, CASE WHEN content ILIKE $${kw.length + 2} THEN 1.0 ELSE 0.7 END AS relevance_score FROM ogo_rag_chunk WHERE dept = $1 AND (${lc}) LIMIT 3`, ['well-integrity', ...kw.map(k => `%${k}%`), `%${kw[0]}%`]);
    return NextResponse.json({ chunks: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
