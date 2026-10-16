export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(`
      SELECT m.*, v.company as vendor_name
      FROM ogv_milestone m
      LEFT JOIN ogv_vendor v ON v.id = m.vendor_id
      ORDER BY m.due_date ASC
    `);
    return NextResponse.json({ milestones: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, contract_id, milestone_name, due_date, payment_amount_cad } = body;
    const res = await pool.query(
      `INSERT INTO ogv_milestone (vendor_id, contract_id, milestone_name, due_date, payment_amount_cad)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [vendor_id || 1, contract_id, milestone_name, due_date, payment_amount_cad]
    );
    return NextResponse.json({ milestone: res.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
