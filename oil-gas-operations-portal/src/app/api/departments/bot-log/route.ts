export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_bot_log (
      id               SERIAL PRIMARY KEY,
      dept             TEXT NOT NULL,
      stream           TEXT,
      message          TEXT,
      response_preview TEXT,
      rag_chunks_used  INT DEFAULT 0,
      latency_ms       INT,
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const res = await pool.query(
      `SELECT id, dept, stream, message, response_preview, rag_chunks_used, latency_ms, created_at
       FROM ogo_bot_log
       ORDER BY created_at DESC
       LIMIT 20`
    );
    return NextResponse.json({ entries: res.rows });
  } catch (err) {
    console.error('[bot-log GET]', err);
    return NextResponse.json({ error: 'Failed to fetch bot log' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const { dept, stream, message, response_preview, rag_chunks_used, latency_ms } = body;

    if (!dept || !message) {
      return NextResponse.json({ error: 'dept and message are required' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO ogo_bot_log (dept, stream, message, response_preview, rag_chunks_used, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [dept, stream ?? null, message, response_preview ?? null, rag_chunks_used ?? 0, latency_ms ?? null]
    );

    return NextResponse.json({ success: true, id: res.rows[0].id, created_at: res.rows[0].created_at });
  } catch (err) {
    console.error('[bot-log POST]', err);
    return NextResponse.json({ error: 'Failed to log bot interaction' }, { status: 500 });
  }
}
