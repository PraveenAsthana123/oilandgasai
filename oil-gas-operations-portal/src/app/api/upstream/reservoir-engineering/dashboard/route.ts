import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(_req: NextRequest) {
  try {
    const tableCheck = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ogo_rsv_metric') AS exists`);
    if (!tableCheck.rows[0].exists) return NextResponse.json({ empty: true, message: 'Run import job to populate' });
    const count = await pool.query(`SELECT COUNT(*) AS total FROM ogo_rsv_metric`);
    if (parseInt(count.rows[0].total) === 0) return NextResponse.json({ empty: true, message: 'Run import job to populate' });

    const [kpis, statusDist, topCapacity, oilTypes] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total_reservoirs, ROUND(SUM(proven_reserves)::numeric,2) AS total_proven_reserves_bb, MAX(production_capacity) AS max_capacity FROM ogo_rsv_metric`),
      pool.query(`SELECT status, COUNT(*) AS cnt FROM ogo_rsv_metric WHERE status IS NOT NULL GROUP BY status ORDER BY cnt DESC`),
      pool.query(`SELECT reservoir_name, production_capacity, basin_region FROM ogo_rsv_metric WHERE production_capacity IS NOT NULL ORDER BY production_capacity DESC LIMIT 5`),
      pool.query(`SELECT oil_type, COUNT(*) AS cnt FROM ogo_rsv_metric WHERE oil_type IS NOT NULL GROUP BY oil_type ORDER BY cnt DESC LIMIT 6`),
    ]);

    return NextResponse.json({
      kpis: kpis.rows[0],
      statusDistribution: statusDist.rows,
      topByCapacity: topCapacity.rows,
      oilTypeDistribution: oilTypes.rows,
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('DATABASE_URL')) {
      return NextResponse.json({ empty: true, message: 'Database not configured. Set DATABASE_URL to enable.', _mock: true });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}