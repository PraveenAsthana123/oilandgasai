export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM ogv_rfq ORDER BY created_at DESC');
    return NextResponse.json({ rfqs: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rfq_number, title, description, service_category, estimated_value_cad, due_date } = body;
    const res = await pool.query(
      `INSERT INTO ogv_rfq (rfq_number, title, description, service_category, estimated_value_cad, due_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [rfq_number, title, description, service_category, estimated_value_cad, due_date]
    );
    return NextResponse.json({ rfq: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
