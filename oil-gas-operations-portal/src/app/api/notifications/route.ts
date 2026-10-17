export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_notification (
  id SERIAL PRIMARY KEY,
  type TEXT,
  message TEXT,
  severity TEXT DEFAULT 'info',
  source_dept TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `SELECT * FROM ogo_notification ORDER BY created_at DESC LIMIT 50`
      );
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE read = false) AS unread,
          COUNT(*) FILTER (WHERE severity = 'critical') AS critical,
          COUNT(*) FILTER (WHERE read = true) AS resolved
        FROM ogo_notification
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, unread: 0, critical: 0, resolved: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mark all read
    if (body.mark_all_read) {
      const client = await pool.connect();
      try {
        await client.query(DDL);
        await client.query(`UPDATE ogo_notification SET read = true`);
        return NextResponse.json({ success: true });
      } finally {
        client.release();
      }
    }

    // Mark single read
    if (body.id && body.read !== undefined) {
      const client = await pool.connect();
      try {
        await client.query(DDL);
        const { rows } = await client.query(
          `UPDATE ogo_notification SET read = $1 WHERE id = $2 RETURNING *`,
          [body.read, body.id]
        );
        return NextResponse.json({ data: rows[0] });
      } finally {
        client.release();
      }
    }

    // Create new notification
    const { type, message, severity, source_dept } = body;
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_notification (type, message, severity, source_dept)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [type, message, severity || 'info', source_dept]
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
