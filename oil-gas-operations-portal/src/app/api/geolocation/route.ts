export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_geo_asset (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT,
  lat NUMERIC,
  lon NUMERIC,
  status TEXT DEFAULT 'active',
  dept TEXT,
  last_inspection DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

const SEEDS = [
  { name: 'Pembina Cardium Well 14-22', type: 'well', lat: 53.02, lon: -114.98, status: 'producing', dept: 'Upstream', last_inspection: '2026-08-15' },
  { name: 'Crossfield Gas Well 8-17', type: 'well', lat: 51.43, lon: -114.03, status: 'producing', dept: 'Upstream', last_inspection: '2026-07-20' },
  { name: 'Fox Creek Duvernay Well 5-9', type: 'well', lat: 54.40, lon: -116.80, status: 'injection', dept: 'Upstream', last_inspection: '2026-09-01' },
  { name: 'Redwater Nisku Well 22-4', type: 'well', lat: 53.95, lon: -112.97, status: 'abandoned', dept: 'Upstream', last_inspection: '2025-11-10' },
  { name: 'Caroline Deep Well 11-33', type: 'well', lat: 51.98, lon: -115.23, status: 'producing', dept: 'Upstream', last_inspection: '2026-06-30' },
  { name: 'Whitecourt Battery 7-19', type: 'well', lat: 54.15, lon: -115.68, status: 'producing', dept: 'Upstream', last_inspection: '2026-08-22' },
  { name: 'Line 47 Crossfield-Airdrie', type: 'pipeline', lat: 51.65, lon: -113.95, status: 'active', dept: 'Midstream', last_inspection: '2026-05-18' },
  { name: 'NOVA NGTL Mainline Segment', type: 'pipeline', lat: 53.55, lon: -113.50, status: 'active', dept: 'Midstream', last_inspection: '2026-03-12' },
  { name: 'Alliance Pipeline Tie-in', type: 'pipeline', lat: 55.20, lon: -117.10, status: 'active', dept: 'Midstream', last_inspection: '2026-07-05' },
  { name: 'Redwater Fractionation Facility', type: 'facility', lat: 53.93, lon: -113.10, status: 'active', dept: 'Midstream', last_inspection: '2026-09-10' },
  { name: 'Strachan Gas Plant', type: 'facility', lat: 52.38, lon: -115.17, status: 'active', dept: 'Midstream', last_inspection: '2026-08-01' },
  { name: 'Fort Saskatchewan Terminal', type: 'facility', lat: 53.71, lon: -113.21, status: 'active', dept: 'Downstream', last_inspection: '2026-06-14' },
  { name: 'Grande Prairie Compression Station', type: 'facility', lat: 55.17, lon: -118.80, status: 'active', dept: 'Midstream', last_inspection: '2026-07-28' },
  { name: 'Viking Formation Well 3-25', type: 'well', lat: 52.70, lon: -110.75, status: 'producing', dept: 'Upstream', last_inspection: '2026-08-10' },
  { name: 'Boundary Lake Pipeline Spur', type: 'pipeline', lat: 56.90, lon: -119.95, status: 'active', dept: 'Midstream', last_inspection: '2026-04-22' },
];

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const countRes = await client.query('SELECT COUNT(*) FROM ogo_geo_asset');
      if (parseInt(countRes.rows[0].count) === 0) {
        for (const s of SEEDS) {
          await client.query(
            `INSERT INTO ogo_geo_asset (name, type, lat, lon, status, dept, last_inspection)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [s.name, s.type, s.lat, s.lon, s.status, s.dept, s.last_inspection]
          );
        }
      }
      const { rows } = await client.query('SELECT * FROM ogo_geo_asset ORDER BY type, name');
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE type = 'well' AND status = 'producing') AS producing_wells,
          COUNT(*) FILTER (WHERE type = 'pipeline' AND status = 'active') AS active_pipelines,
          COUNT(*) FILTER (WHERE type = 'facility' AND status = 'active') AS active_facilities
        FROM ogo_geo_asset
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, producing_wells: 0, active_pipelines: 0, active_facilities: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, lat, lon, status, dept, last_inspection } = body;
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_geo_asset (name, type, lat, lon, status, dept, last_inspection)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, type || 'well', lat, lon, status || 'active', dept || 'Operations', last_inspection || null]
      );
      return NextResponse.json({ data: rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: null, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
