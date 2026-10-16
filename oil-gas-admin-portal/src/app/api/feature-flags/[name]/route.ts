import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const res = await query(`SELECT * FROM oga_feature_flag WHERE feature_name=$1`, [params.name]);
    if (!res.rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const body = await req.json();
    const { enabled } = body;
    const res = await query(
      `UPDATE oga_feature_flag SET enabled=$1, updated_at=NOW() WHERE feature_name=$2 RETURNING *`,
      [enabled, params.name]
    );
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
