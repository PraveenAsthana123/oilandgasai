export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_quotation (
  id SERIAL PRIMARY KEY,
  quote_num TEXT,
  vendor TEXT,
  service_type TEXT,
  amount_k NUMERIC,
  status TEXT DEFAULT 'pending',
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_quotation ORDER BY created_at DESC LIMIT 100`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_review,
          COUNT(*) FILTER (WHERE status = 'accepted') AS accepted,
          COALESCE(SUM(amount_k) / 1000, 0) AS total_value
        FROM ogo_quotation
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, pending_review: 0, accepted: 0, total_value: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor, service_type, amount_k, notes, expiry_date } = body;
    const quote_num = `QT-${Date.now().toString().slice(-6)}`;

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_quotation (quote_num, vendor, service_type, amount_k, notes, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [quote_num, vendor, service_type, amount_k, notes, expiry_date || null]
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
