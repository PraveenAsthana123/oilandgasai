export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT cd.*, v.company as vendor_name
      FROM ogv_compliance_doc cd
      LEFT JOIN ogv_vendor v ON v.id = cd.vendor_id
      ORDER BY cd.valid_to ASC
    `);
    return NextResponse.json({ compliance_docs: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, doc_type, valid_from, valid_to } = body;
    const res = await pool.query(
      `INSERT INTO ogv_compliance_doc (vendor_id, doc_type, valid_from, valid_to)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [vendor_id || 1, doc_type, valid_from, valid_to]
    );
    return NextResponse.json({ doc: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
