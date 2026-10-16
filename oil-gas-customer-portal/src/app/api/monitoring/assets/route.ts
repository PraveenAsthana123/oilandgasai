export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  const opsUrl = process.env.OPERATIONS_API_URL;
  if (opsUrl) {
    // In production, proxy to live operations platform
    try {
      const resp = await fetch(`${opsUrl}/api/asset-status`);
      if (resp.ok) {
        const data = await resp.json();
        return Response.json({ ...data, _source: 'live' });
      }
    } catch {}
  }

  // Fallback: local DB
  try {
    const { rows } = await pool.query(`
      SELECT am.*, cu.company FROM ogcu_asset_monitoring am
      JOIN ogcu_customer cu ON cu.id = am.customer_id
      ORDER BY am.customer_id, am.asset_type
    `);

    const byType: Record<string, { count: number; alerts: number; assets: typeof rows }> = {};
    for (const r of rows) {
      if (!byType[r.asset_type]) byType[r.asset_type] = { count: 0, alerts: 0, assets: [] };
      byType[r.asset_type].count++;
      byType[r.asset_type].alerts += r.alert_count || 0;
      byType[r.asset_type].assets.push(r);
    }

    return Response.json({
      assets: rows,
      summary: byType,
      _mock: !opsUrl,
      _reason: !opsUrl ? '⚠️ Mocked — OPERATIONS_API_URL not set. Set OPERATIONS_API_URL to connect to live monitoring platform.' : undefined,
    });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
