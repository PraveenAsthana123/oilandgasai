export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT i.*, v.company as vendor_name, po.po_number
      FROM ogv_invoice i
      LEFT JOIN ogv_vendor v ON v.id = i.vendor_id
      LEFT JOIN ogv_purchase_order po ON po.id = i.po_id
      ORDER BY i.created_at DESC
    `);
    return NextResponse.json({ invoices: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, po_id, invoice_number, amount_cad, hst_cad } = body;
    const total = (parseFloat(amount_cad) || 0) + (parseFloat(hst_cad) || 0);
    const res = await pool.query(
      `INSERT INTO ogv_invoice (vendor_id, po_id, invoice_number, amount_cad, hst_cad, total_cad)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [vendor_id || 1, po_id, invoice_number, amount_cad, hst_cad || amount_cad * 0.13, total]
    );
    return NextResponse.json({ invoice: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
