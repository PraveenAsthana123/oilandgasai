import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(_req: NextRequest) {
  try {
    const tc = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_exp_metric') AS exists`);
    if (!tc.rows[0].exists) return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    const count = await pool.query(`SELECT COUNT(*) AS total FROM ogo_exp_metric`);
    if (parseInt(count.rows[0].total) === 0) return NextResponse.json({ empty: true, message: 'Run import job to populate' });

    const [kpis, faciesDist, formations, wells] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT well_name) AS total_wells, COUNT(DISTINCT formation) AS formation_count, ROUND(AVG(gr)::numeric,2) AS avg_gr, COUNT(*) AS total_readings FROM ogo_exp_metric`),
      pool.query(`SELECT facies, COUNT(*) AS cnt FROM ogo_exp_metric WHERE facies IS NOT NULL GROUP BY facies ORDER BY facies`),
      pool.query(`SELECT formation, COUNT(*) AS reading_count, ROUND(AVG(gr)::numeric,2) AS avg_gr FROM ogo_exp_metric WHERE formation IS NOT NULL GROUP BY formation ORDER BY reading_count DESC LIMIT 8`),
      pool.query(`SELECT DISTINCT well_name, COUNT(*) AS readings, MIN(depth) AS min_depth, MAX(depth) AS max_depth FROM ogo_exp_metric WHERE well_name IS NOT NULL GROUP BY well_name ORDER BY readings DESC LIMIT 8`),
    ]);

    return NextResponse.json({ kpis: kpis.rows[0], faciesDistribution: faciesDist.rows, formations: formations.rows, wells: wells.rows });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}