import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { role, active, mfa_enabled } = body;
    const res = await query(
      `UPDATE oga_user SET role=COALESCE($1,role), active=COALESCE($2,active), mfa_enabled=COALESCE($3,mfa_enabled) WHERE id=$4 RETURNING *`,
      [role ?? null, active ?? null, mfa_enabled ?? null, params.id]
    );
    return NextResponse.json(res.rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query(`UPDATE oga_user SET active=false WHERE id=$1`, [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
