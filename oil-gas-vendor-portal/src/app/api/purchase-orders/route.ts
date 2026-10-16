export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT po.*, v.company as vendor_name
      FROM ogv_purchase_order po
      LEFT JOIN ogv_vendor v ON v.id = po.vendor_id
      ORDER BY po.created_at DESC
    `);
    return NextResponse.json({ purchase_orders: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, po_number, title, amount_cad, delivery_date } = body;
    const res = await pool.query(
      `INSERT INTO ogv_purchase_order (vendor_id, po_number, title, amount_cad, delivery_date)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [vendor_id, po_number, title, amount_cad, delivery_date]
    );
    return NextResponse.json({ purchase_order: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
