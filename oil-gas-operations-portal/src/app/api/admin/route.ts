export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const [users, roles, audit, flags] = await Promise.all([
      pool.query('SELECT COUNT(*) as cnt FROM ogo_role'),
      pool.query('SELECT * FROM ogo_role ORDER BY name'),
      pool.query('SELECT * FROM ogo_audit_log ORDER BY ts DESC LIMIT 20'),
      pool.query('SELECT * FROM ogo_feature_flag ORDER BY flag_key'),
    ]);
    return Response.json({ roles: roles.rows, audit_log: audit.rows, feature_flags: flags.rows });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
