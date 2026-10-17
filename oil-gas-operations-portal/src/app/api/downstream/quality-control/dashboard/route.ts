export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_quality_metric (
      id SERIAL PRIMARY KEY, well_name TEXT, formation TEXT, gr NUMERIC,
      pe NUMERIC, phind NUMERIC, quality_score NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const [statsRes, passRes, formRes, peRes] = await Promise.all([
      pool.query(`SELECT
        ROUND(COALESCE(MIN(gr),0)::numeric,1) AS gr_min,
        ROUND(COALESCE(MAX(gr),0)::numeric,1) AS gr_max,
        ROUND(COALESCE(AVG(gr),0)::numeric,1) AS gr_avg
        FROM ogo_quality_metric`),
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE quality_score >= 0.6) AS pass,
        COUNT(*) FILTER (WHERE quality_score < 0.6) AS fail,
        ROUND(COALESCE(AVG(quality_score),0)::numeric,3) AS avg_score
        FROM ogo_quality_metric`),
      pool.query(`SELECT formation, ROUND(AVG(quality_score)::numeric,3) AS avg_q
        FROM ogo_quality_metric WHERE formation IS NOT NULL GROUP BY formation ORDER BY avg_q DESC LIMIT 8`),
      pool.query(`SELECT ROUND(COALESCE(AVG(pe),0)::numeric,2) AS pe_avg FROM ogo_quality_metric WHERE pe > 0`),
    ]);

    return NextResponse.json({
      kpis: {
        gr_min: statsRes.rows[0]?.gr_min,
        gr_max: statsRes.rows[0]?.gr_max,
        gr_avg: statsRes.rows[0]?.gr_avg,
        pe_avg: Number(peRes.rows[0]?.pe_avg || 0),
        pass: Number(passRes.rows[0]?.pass || 0),
        fail: Number(passRes.rows[0]?.fail || 0),
        avg_quality_score: Number(passRes.rows[0]?.avg_score || 0),
      },
      formation_quality: formRes.rows,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
