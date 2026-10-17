import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(_req: NextRequest) {
  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_drill_metric') AS exists
    `);
    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    }
    const count = await pool.query(`SELECT COUNT(*) AS total FROM ogo_drill_metric`);
    if (parseInt(count.rows[0].total) === 0) {
      return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    }

    const [kpis, gasTypes, topDepths, trend] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) AS total_readings,
               ROUND(AVG(total_gas_ppm)::numeric,2) AS avg_gas_ppm,
               MAX(depth_m) AS max_depth_m,
               MAX(total_gas_ppm) AS max_gas_ppm
        FROM ogo_drill_metric
      `),
      pool.query(`
        SELECT gas_type, COUNT(*) AS cnt
        FROM ogo_drill_metric
        WHERE gas_type IS NOT NULL AND gas_type != 'UNKNOWN'
        GROUP BY gas_type ORDER BY cnt DESC LIMIT 8
      `),
      pool.query(`
        SELECT depth_m, total_gas_ppm, gas_type
        FROM ogo_drill_metric
        ORDER BY total_gas_ppm DESC LIMIT 10
      `),
      pool.query(`
        SELECT ROUND(depth_m/500)*500 AS depth_bucket,
               ROUND(AVG(total_gas_ppm)::numeric,2) AS avg_gas
        FROM ogo_drill_metric
        GROUP BY depth_bucket ORDER BY depth_bucket LIMIT 12
      `),
    ]);

    return NextResponse.json({
      kpis: kpis.rows[0],
      gasTypeDistribution: gasTypes.rows,
      topGasPeaks: topDepths.rows,
      depthTrend: trend.rows,
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
