export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM ogv_audit_log ORDER BY ts DESC LIMIT 100');
    return NextResponse.json({ logs: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, action, record_type, record_id, details } = body;
    const res = await pool.query(
      `INSERT INTO ogv_audit_log (user_id, action, record_type, record_id, details)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, action, record_type, record_id, JSON.stringify(details || {})]
    );
    return NextResponse.json({ log: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
