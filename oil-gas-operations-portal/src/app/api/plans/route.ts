export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_plan (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT,
  year INT,
  status TEXT DEFAULT 'draft',
  wells_planned INT DEFAULT 0,
  budget_m NUMERIC,
  approved_by TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_plan ORDER BY year DESC, created_at DESC LIMIT 100`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'active') AS active,
          COUNT(*) FILTER (WHERE status = 'draft') AS draft,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved,
          COALESCE(SUM(wells_planned), 0) AS total_wells
        FROM ogo_plan
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { active: 0, draft: 0, approved: 0, total_wells: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, year, wells_planned, budget_m, approved_by, ai_assist } = body;

    let ai_summary: string | null = null;
    if (ai_assist) {
      try {
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const prompt = `Draft a concise 3-sentence executive summary for an O&G operational plan titled "${name}" of type "${type}" for year ${year}. Wells planned: ${wells_planned}, Budget: $${budget_m}M.`;
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
        `INSERT INTO ogo_plan (name, type, year, wells_planned, budget_m, approved_by, ai_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, type, year, wells_planned || 0, budget_m, approved_by, ai_summary]
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
