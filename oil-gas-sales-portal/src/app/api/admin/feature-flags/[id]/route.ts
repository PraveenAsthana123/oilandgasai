export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const result = await pool.query(
      'UPDATE ogs_feature_flag SET enabled = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [body.enabled, params.id]
    );
    return Response.json(result.rows[0]);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
