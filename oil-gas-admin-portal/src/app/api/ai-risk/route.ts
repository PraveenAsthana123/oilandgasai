import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT r.*, m.model_name FROM oga_ai_risk r LEFT JOIN oga_ai_model m ON m.id=r.model_id ORDER BY r.severity DESC, r.created_at DESC`);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
