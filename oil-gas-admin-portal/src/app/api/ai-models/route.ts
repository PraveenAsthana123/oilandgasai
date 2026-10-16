import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT m.*,
      (SELECT json_agg(r.*) FROM oga_ai_risk r WHERE r.model_id = m.id) as risks
      FROM oga_ai_model m ORDER BY m.created_at DESC`);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
