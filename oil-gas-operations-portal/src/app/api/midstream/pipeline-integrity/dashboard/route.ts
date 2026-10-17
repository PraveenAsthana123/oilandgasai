export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const client = await pool.connect();
    const tableCheck = await client.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name='ogo_pipe_metric') AS exists`
    );
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({
        total_segments: 0, avg_thickness_mm: 0, high_corrosion_count: 0,
        condition_good: 0, condition_fair: 0, condition_poor: 0, condition_critical: 0,
        monthly_corrosion: [], thickness_by_material: [], alerts: [],
      });
    }

    const [kpi, condDist, matThick] = await Promise.all([
      client.query(`
        SELECT COUNT(*) AS total,
               AVG(thickness_mm) AS avg_thick,
               SUM(CASE WHEN corrosion_pct > 20 THEN 1 ELSE 0 END) AS high_corr
        FROM ogo_pipe_metric
      `),
      client.query(`
        SELECT condition, COUNT(*) AS cnt FROM ogo_pipe_metric GROUP BY condition
      `),
      client.query(`
        SELECT material, AVG(thickness_mm) AS avg_mm
        FROM ogo_pipe_metric GROUP BY material ORDER BY avg_mm DESC LIMIT 8
      `),
    ]);

    const condMap: Record<string, number> = {};
    for (const row of condDist.rows) condMap[row.condition?.toLowerCase() ?? ''] = parseInt(row.cnt, 10);

    const monthlyCorrRes = await client.query(`
      SELECT EXTRACT(MONTH FROM imported_at) AS mo, AVG(corrosion_pct) AS avg_pct
      FROM ogo_pipe_metric GROUP BY mo ORDER BY mo
    `);

    const alerts = [];
    if (parseInt(kpi.rows[0].high_corr, 10) > 50) {
      alerts.push({ severity: 'critical', message: `${kpi.rows[0].high_corr} segments exceed 20% corrosion threshold`, ts: new Date().toISOString() });
    }
    if ((condMap['critical'] ?? 0) > 0) {
      alerts.push({ severity: 'critical', message: `${condMap['critical']} segments in Critical condition`, ts: new Date().toISOString() });
    }

    return NextResponse.json({
      total_segments: parseInt(kpi.rows[0].total, 10),
      avg_thickness_mm: parseFloat(kpi.rows[0].avg_thick ?? 0),
      high_corrosion_count: parseInt(kpi.rows[0].high_corr ?? 0, 10),
      condition_good: condMap['good'] ?? 0,
      condition_fair: condMap['fair'] ?? condMap['moderate'] ?? 0,
      condition_poor: condMap['poor'] ?? 0,
      condition_critical: condMap['critical'] ?? 0,
      monthly_corrosion: monthlyCorrRes.rows.map(r => ({ month: `M${r.mo}`, avg_pct: parseFloat(r.avg_pct) })),
      thickness_by_material: matThick.rows.map(r => ({ material: r.material, avg_mm: parseFloat(r.avg_mm) })),
      alerts,
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}