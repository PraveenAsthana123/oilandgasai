import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT *,
      CASE WHEN valid_to < NOW() THEN 'expired'
           WHEN valid_to < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
           ELSE 'active' END AS computed_status
      FROM oga_permit ORDER BY valid_to ASC`);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { permit_type, regulator, permit_number, asset, valid_from, valid_to } = body;
    const res = await query(
      `INSERT INTO oga_permit (permit_type, regulator, permit_number, asset, valid_from, valid_to, status) VALUES ($1,$2,$3,$4,$5,$6,'active') RETURNING *`,
      [permit_type, regulator, permit_number, asset, valid_from, valid_to]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
