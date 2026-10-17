export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_proposal (
  id SERIAL PRIMARY KEY,
  title TEXT,
  type TEXT,
  description TEXT,
  value_m NUMERIC,
  engineer TEXT,
  status TEXT DEFAULT 'draft',
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_proposal ORDER BY created_at DESC LIMIT 100`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved,
          COALESCE(SUM(value_m), 0) AS total_value
        FROM ogo_proposal
      `);
      const kpis = kpiRes.rows[0];
      return NextResponse.json({ data: rows, kpis });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, under_review: 0, approved: 0, total_value: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, type, description, value_m, engineer, ai_assist } = body;

    let ai_summary: string | null = null;
    if (ai_assist) {
      try {
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const prompt = `Write a concise 3-sentence executive summary for an O&G proposal titled "${title}" of type "${type}" valued at $${value_m}M. Description: ${description}`;
        const res = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
        });
        if (res.ok) {
          const json = await res.json();
          ai_summary = json.response ?? null;
        }
      } catch {
        ai_summary = null;
      }
    }

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_proposal (title, type, description, value_m, engineer, ai_summary)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, type, description, value_m, engineer, ai_summary]
      );
      return NextResponse.json({ data: rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: null, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
