export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, comment } = await request.json();
    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    // Get reviewer from session cookie if present
    let reviewer = 'admin@oilandgas.com';
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/og_session=([^;]+)/);
    if (match) {
      try {
        const decoded = JSON.parse(Buffer.from(match[1], 'base64').toString());
        reviewer = decoded.userId || reviewer;
      } catch { /* ignore decode errors */ }
    }

    const res = await pool.query(
      `UPDATE ogo_approval
       SET status = $1, reviewer = $2, review_comment = $3, reviewed_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, reviewer, comment || '', params.id]
    );

    if (res.rowCount === 0) {
      return Response.json({ error: 'Approval not found' }, { status: 404 });
    }

    return Response.json({ ok: true, approval: res.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, _mock: true }, { status: 500 });
  }
}
