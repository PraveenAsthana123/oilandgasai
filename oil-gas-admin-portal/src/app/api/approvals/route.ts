import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM oga_approval ORDER BY created_at DESC`);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, reviewed_by } = body;
    const res = await query(
      `UPDATE oga_approval SET status=$1, reviewed_by=$2, reviewed_at=NOW() WHERE id=$3 RETURNING *`,
      [status, reviewed_by ?? 'admin@oilgas.com', id]
    );
    // Log audit
    await query(
      `INSERT INTO oga_audit_log (user_id, action, module, record_type, record_id, details) VALUES ($1,'APPROVE','approvals','approval',$2,$3)`,
      [reviewed_by ?? 'admin@oilgas.com', String(id), JSON.stringify({ status })]
    );
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
