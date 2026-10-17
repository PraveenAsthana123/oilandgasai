export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  try {
    const { rows } = await pool.query(
      `SELECT id, content, created_at FROM ogo_rag_chunk WHERE dept='crude-trading' AND content ILIKE $1 LIMIT 5`,
      [`%${query}%`]
    );
    return NextResponse.json({ results: rows, count: rows.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
