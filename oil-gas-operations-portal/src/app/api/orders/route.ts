export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_order (
  id SERIAL PRIMARY KEY,
  po_number TEXT,
  item TEXT,
  vendor TEXT,
  amount_k NUMERIC,
  status TEXT DEFAULT 'open',
  expected_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_order ORDER BY created_at DESC LIMIT 100`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'open') AS open,
          COUNT(*) FILTER (WHERE status = 'in_transit') AS in_transit,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed
        FROM ogo_order
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, open: 0, in_transit: 0, completed: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item, vendor, amount_k, expected_delivery } = body;
    const po_number = `PO-${Date.now().toString().slice(-6)}`;

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_order (po_number, item, vendor, amount_k, expected_delivery)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [po_number, item, vendor, amount_k, expected_delivery || null]
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
