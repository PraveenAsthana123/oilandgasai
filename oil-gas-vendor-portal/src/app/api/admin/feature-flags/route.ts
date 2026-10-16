export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query('SELECT * FROM ogv_feature_flag ORDER BY name');
    return NextResponse.json({ flags: res.rows });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, enabled } = await req.json();
    await pool.query(
      `UPDATE ogv_feature_flag SET enabled = $1 WHERE name = $2`,
      [enabled, name]
    );
    return NextResponse.json({ status: 'updated' });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
