export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM ogv_vendor ORDER BY created_at DESC');
    return NextResponse.json({ vendors: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, business_number, hst_number, service_categories, safety_trif, wsib_status } = body;
    const res = await pool.query(
      `INSERT INTO ogv_vendor (company, business_number, hst_number, service_categories, safety_trif, wsib_status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [company, business_number, hst_number, JSON.stringify(service_categories || []), safety_trif || 0, wsib_status || 'pending']
    );
    return NextResponse.json({ vendor: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
