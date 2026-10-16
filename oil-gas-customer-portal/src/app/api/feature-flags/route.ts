export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM ogcu_feature_flag ORDER BY flag_name');
    return Response.json({ flags: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, enabled } = await req.json();
    const { rows } = await pool.query(
      'UPDATE ogcu_feature_flag SET enabled = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [enabled, id]
    );
    return Response.json({ flag: rows[0] });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
