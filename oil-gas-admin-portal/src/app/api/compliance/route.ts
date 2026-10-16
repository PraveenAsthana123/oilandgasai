import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const regulator = searchParams.get('regulator') ?? '';
  try {
    let sql = `SELECT * FROM oga_compliance WHERE 1=1`;
    const params: string[] = [];
    if (regulator) {
      params.push(regulator);
      sql += ` AND regulator = $${params.length}`;
    }
    sql += ' ORDER BY regulator, requirement';
    const res = await query(sql, params);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;
    const res = await query(
      `UPDATE oga_compliance SET status=$1, notes=$2, last_checked=NOW() WHERE id=$3 RETURNING *`,
      [status, notes, id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
