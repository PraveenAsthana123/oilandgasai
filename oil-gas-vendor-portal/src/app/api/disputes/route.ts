export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM ogv_dispute ORDER BY created_at DESC');
    return NextResponse.json({ disputes: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, dispute_type, related_id, description } = body;
    const res = await pool.query(
      `INSERT INTO ogv_dispute (vendor_id, dispute_type, related_id, description)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [vendor_id || 1, dispute_type, related_id, description]
    );
    return NextResponse.json({ dispute: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
