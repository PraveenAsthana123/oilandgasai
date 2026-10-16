import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM oga_inspection ORDER BY scheduled_date DESC`);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inspection_type, location, scheduled_date, inspector } = body;
    const res = await query(
      `INSERT INTO oga_inspection (inspection_type, location, scheduled_date, inspector, status) VALUES ($1,$2,$3,$4,'scheduled') RETURNING *`,
      [inspection_type, location, scheduled_date, inspector]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, findings, corrective_actions, completed_date } = body;
    const res = await query(
      `UPDATE oga_inspection SET status=$1, findings=$2, corrective_actions=$3, completed_date=$4 WHERE id=$5 RETURNING *`,
      [status, findings, corrective_actions, completed_date, id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
