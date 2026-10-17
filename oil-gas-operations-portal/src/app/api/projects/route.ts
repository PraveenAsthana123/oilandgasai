export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_project (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT,
  status TEXT DEFAULT 'planning',
  budget_m NUMERIC,
  spent_m NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  pm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_project ORDER BY created_at DESC LIMIT 100`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'active') AS active,
          COUNT(*) FILTER (WHERE spent_m <= budget_m AND status = 'active') AS on_budget,
          COUNT(*) FILTER (WHERE end_date >= NOW() AND status = 'active') AS on_schedule,
          COALESCE(SUM(budget_m), 0) AS total_budget
        FROM ogo_project
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { active: 0, on_budget: 0, on_schedule: 0, total_budget: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, budget_m, start_date, end_date, pm } = body;

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_project (name, type, budget_m, start_date, end_date, pm)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, type, budget_m, start_date || null, end_date || null, pm]
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
