export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_enviro_metric (
      id SERIAL PRIMARY KEY, country TEXT, sector TEXT, gas TEXT, unit TEXT,
      year INT, value NUMERIC, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_spill_metric (
      id SERIAL PRIMARY KEY, vessel TEXT, location TEXT, incident_date TEXT,
      min_tonnes NUMERIC, max_tonnes NUMERIC, owner TEXT, imported_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const [totalRes, countriesRes, trendRes, topRes, spillRes] = await Promise.all([
      pool.query(`SELECT ROUND(COALESCE(SUM(value),0)::numeric,2) AS total_ch4 FROM ogo_enviro_metric`),
      pool.query(`SELECT COUNT(DISTINCT country) AS countries FROM ogo_enviro_metric`),
      pool.query(`SELECT year, ROUND(SUM(value)::numeric,2) AS total FROM ogo_enviro_metric WHERE year IS NOT NULL GROUP BY year ORDER BY year`),
      pool.query(`SELECT country, ROUND(SUM(value)::numeric,2) AS total FROM ogo_enviro_metric GROUP BY country ORDER BY total DESC LIMIT 10`),
      pool.query(`SELECT COUNT(*) AS spills, COALESCE(SUM(max_tonnes),0) AS total_tonnes FROM ogo_spill_metric`),
    ]);

    return NextResponse.json({
      kpis: {
        total_ch4: Number(totalRes.rows[0]?.total_ch4 || 0),
        countries_tracked: Number(countriesRes.rows[0]?.countries || 0),
        spills_recorded: Number(spillRes.rows[0]?.spills || 0),
        total_spill_tonnes: Number(spillRes.rows[0]?.total_tonnes || 0),
      },
      emission_trend: trendRes.rows,
      top_emitters: topRes.rows,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
