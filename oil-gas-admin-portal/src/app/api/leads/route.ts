import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM oga_lead ORDER BY created_at DESC`);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_name, contact_name, email, phone, value, notes } = body;
    const res = await query(
      `INSERT INTO oga_lead (company_name, contact_name, email, phone, value, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [company_name, contact_name, email, phone, value, notes]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
