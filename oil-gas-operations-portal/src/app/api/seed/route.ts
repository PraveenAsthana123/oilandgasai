export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'ogo_%' ORDER BY tablename`
    );
    return NextResponse.json({ status: 'ready', tables: res.rows.map((r: { tablename: string }) => r.tablename) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: 'no_db', _mock: true, _reason: msg });
  }
}

export async function POST() {
  const seeded: string[] = [];

  try {
    const client = await pool.connect();
    try {
      // --- ogo_notification ---
      await client.query(`CREATE TABLE IF NOT EXISTS ogo_notification (
        id SERIAL PRIMARY KEY,
        type TEXT,
        message TEXT,
        severity TEXT DEFAULT 'info',
        source_dept TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      const notifCount = await client.query('SELECT COUNT(*) FROM ogo_notification');
      if (parseInt(notifCount.rows[0].count) === 0) {
        const notifications = [
          ['alert', 'Well 14-22 casing pressure exceeded threshold — immediate inspection required', 'critical', 'Upstream'],
          ['info', 'AER Directive 056 Q3 2026 filing due in 7 days', 'warning', 'Regulatory Affairs'],
          ['info', 'ILI run on Line 47 completed — 2 anomalies flagged for review', 'info', 'Midstream'],
          ['alert', 'H2S detector calibration overdue at Whitecourt Battery', 'warning', 'HSE'],
          ['info', 'Monthly production volumes submitted to AER successfully', 'info', 'Operations'],
        ];
        for (const [type, message, severity, source_dept] of notifications) {
          await client.query(
            `INSERT INTO ogo_notification (type, message, severity, source_dept) VALUES ($1,$2,$3,$4)`,
            [type, message, severity, source_dept]
          );
        }
        seeded.push('notifications');
      }

      // --- ogo_geo_asset ---
      await client.query(`CREATE TABLE IF NOT EXISTS ogo_geo_asset (
        id SERIAL PRIMARY KEY,
        name TEXT,
        type TEXT,
        lat NUMERIC,
        lon NUMERIC,
        status TEXT DEFAULT 'active',
        dept TEXT,
        last_inspection DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      const geoCount = await client.query('SELECT COUNT(*) FROM ogo_geo_asset');
      if (parseInt(geoCount.rows[0].count) === 0) {
        const assets = [
          ['Pembina Cardium Well 14-22', 'well', 53.02, -114.98, 'producing', 'Upstream', '2026-08-15'],
          ['Crossfield Gas Well 8-17', 'well', 51.43, -114.03, 'producing', 'Upstream', '2026-07-20'],
          ['Line 47 Crossfield-Airdrie', 'pipeline', 51.65, -113.95, 'active', 'Midstream', '2026-05-18'],
          ['Strachan Gas Plant', 'facility', 52.38, -115.17, 'active', 'Midstream', '2026-08-01'],
          ['Fox Creek Duvernay Well 5-9', 'well', 54.40, -116.80, 'injection', 'Upstream', '2026-09-01'],
        ];
        for (const [name, type, lat, lon, status, dept, last_inspection] of assets) {
          await client.query(
            `INSERT INTO ogo_geo_asset (name, type, lat, lon, status, dept, last_inspection) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [name, type, lat, lon, status, dept, last_inspection]
          );
        }
        seeded.push('geo_assets');
      }

      // --- ogo_blog_post ---
      await client.query(`CREATE TABLE IF NOT EXISTS ogo_blog_post (
        id SERIAL PRIMARY KEY,
        title TEXT,
        category TEXT,
        content TEXT,
        author TEXT DEFAULT 'System',
        tags TEXT,
        read_time_mins INT DEFAULT 3,
        featured BOOLEAN DEFAULT FALSE,
        ai_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      const blogCount = await client.query('SELECT COUNT(*) FROM ogo_blog_post');
      if (parseInt(blogCount.rows[0].count) === 0) {
        const posts = [
          ['AI in Upstream Operations: From Seismic to Production Optimization', 'AI/ML', 'Dr. M. Patel', 'AI,Machine Learning,Upstream', 7, true],
          ['Pipeline Integrity Best Practices: ILI, ECDA, and Risk-Based Inspection', 'Operations', 'R. Tanner, P.Eng.', 'Pipeline,Integrity,Inspection', 6, false],
          ['ECCC Methane Reporting 2026: What Operators Need to Know', 'Regulatory', 'S. Okafor', 'Methane,ECCC,Compliance', 5, false],
        ];
        for (const [title, category, author, tags, read_time_mins, featured] of posts) {
          await client.query(
            `INSERT INTO ogo_blog_post (title, category, author, tags, read_time_mins, featured, content) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [title, category, author, tags, read_time_mins, featured, `Seeded article on ${title}. See /blog for full content.`]
          );
        }
        seeded.push('blog_posts');
      }

      // --- ogo_contact ---
      await client.query(`CREATE TABLE IF NOT EXISTS ogo_contact (
        id SERIAL PRIMARY KEY,
        name TEXT,
        role TEXT,
        company TEXT,
        phone TEXT,
        email TEXT,
        type TEXT DEFAULT 'internal',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      const contactCount = await client.query('SELECT COUNT(*) FROM ogo_contact');
      if (parseInt(contactCount.rows[0].count) === 0) {
        const contacts = [
          ['Sarah Okafor', 'Regulatory Affairs Advisor', 'Alberta Energy Regulator', '403-297-8311', 's.okafor@aer.ca', 'Regulator', 'Primary AER contact'],
          ['James Mackenzie', 'Drilling Superintendent', 'Internal — Upstream Ops', '403-555-0142', 'j.mackenzie@company.com', 'Internal', 'Pembina and Duvernay drilling lead'],
          ['Lisa Gagnon', 'HSE Manager', 'Internal — HSE', '403-555-0198', 'l.gagnon@company.com', 'Internal', 'Emergency contact for all HSE incidents'],
          ['Precision Drilling Corp.', 'Account Manager', 'Precision Drilling Corp.', '403-716-4500', 'operations@precisiondrilling.com', 'Contractor', '3 rigs contracted Q3-Q4 2026'],
          ['Halliburton Canada', 'Completions Account Manager', 'Halliburton Canada', '403-231-7700', 'completions.canada@halliburton.com', 'Vendor', 'Fracturing and completions services'],
        ];
        for (const [name, role, company, phone, email, type, notes] of contacts) {
          await client.query(
            `INSERT INTO ogo_contact (name, role, company, phone, email, type, notes) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [name, role, company, phone, email, type, notes]
          );
        }
        seeded.push('contacts');
      }

    } finally {
      client.release();
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ seeded, error: msg, ts: new Date() }, { status: 207 });
  }

  return NextResponse.json({ seeded, ts: new Date() });
}
