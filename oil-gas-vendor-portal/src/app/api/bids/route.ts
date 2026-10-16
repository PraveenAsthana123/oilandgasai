export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT b.*, r.rfq_number, r.title as rfq_title, r.service_category
      FROM ogv_bid b
      LEFT JOIN ogv_rfq r ON r.id = b.rfq_id
      ORDER BY b.created_at DESC
    `);
    return NextResponse.json({ bids: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rfq_id, vendor_id, amount_cad, hst_cad, delivery_days, validity_days, notes } = body;
    const res = await pool.query(
      `INSERT INTO ogv_bid (rfq_id, vendor_id, amount_cad, hst_cad, delivery_days, validity_days, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [rfq_id, vendor_id || 1, amount_cad, hst_cad || amount_cad * 0.13, delivery_days, validity_days || 30, notes]
    );
    return NextResponse.json({ bid: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
