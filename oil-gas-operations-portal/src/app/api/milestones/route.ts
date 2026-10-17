export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_milestone (
  id SERIAL PRIMARY KEY,
  name TEXT,
  project TEXT,
  due_date DATE,
  status TEXT DEFAULT 'on-track',
  owner TEXT,
  pct_complete INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_milestone ORDER BY due_date ASC NULLS LAST LIMIT 100`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'on-track') AS on_track,
          COUNT(*) FILTER (WHERE status = 'at-risk') AS at_risk,
          COUNT(*) FILTER (WHERE status = 'complete') AS completed
        FROM ogo_milestone
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, on_track: 0, at_risk: 0, completed: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, project, due_date, owner, pct_complete } = body;

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_milestone (name, project, due_date, owner, pct_complete)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, project, due_date || null, owner, pct_complete || 0]
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
