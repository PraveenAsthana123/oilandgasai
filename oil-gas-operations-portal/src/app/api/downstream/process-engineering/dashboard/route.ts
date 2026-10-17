export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_process_metric (
      id SERIAL PRIMARY KEY, well_name TEXT, formation TEXT, gr NUMERIC,
      ild_log10 NUMERIC, phind NUMERIC, pe NUMERIC, facies INT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const [avgRes, formRes, phindRes, faciesRes] = await Promise.all([
      pool.query(`SELECT COALESCE(AVG(gr),0) AS avg_gr, COUNT(DISTINCT formation) AS formations FROM ogo_process_metric`),
      pool.query(`SELECT formation, COUNT(*) AS cnt FROM ogo_process_metric WHERE formation IS NOT NULL GROUP BY formation ORDER BY cnt DESC LIMIT 8`),
      pool.query(`SELECT
        ROUND(COALESCE(MIN(phind),0)::numeric,1) AS min_phind,
        ROUND(COALESCE(MAX(phind),0)::numeric,1) AS max_phind,
        ROUND(COALESCE(AVG(phind),0)::numeric,1) AS avg_phind
        FROM ogo_process_metric`),
      pool.query(`SELECT facies, COUNT(*) AS cnt FROM ogo_process_metric WHERE facies IS NOT NULL GROUP BY facies ORDER BY facies LIMIT 9`),
    ]);

    return NextResponse.json({
      kpis: {
        avg_gr: Number(avgRes.rows[0]?.avg_gr || 0).toFixed(1),
        formations: Number(avgRes.rows[0]?.formations || 0),
        avg_phind: Number(phindRes.rows[0]?.avg_phind || 0),
        facies_types: faciesRes.rows.length,
      },
      formations: formRes.rows,
      phind_stats: phindRes.rows[0],
      facies_dist: faciesRes.rows,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
