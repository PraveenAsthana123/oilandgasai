export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import pool from '@/lib/db';

const DEPARTMENTS = [
  'Upstream', 'Midstream', 'Downstream', 'AI/ML', 'Sales', 'Admin',
  'Customer', 'Engineering', 'Data Science', 'HSE', 'Procurement',
  'Petroleum Economics', 'Regulatory Affairs', 'Project Management',
  'Mechanical Maintenance', 'SCADA', 'Pipeline Integrity', 'Trading',
];

const DEFAULT_FLAGS = [
  'Upstream', 'Midstream', 'Downstream', 'AI/ML', 'Sales', 'Admin', 'Customer', 'Engineering',
];

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_feature_flag (
      id SERIAL PRIMARY KEY,
      feature TEXT UNIQUE,
      enabled BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ogo_user_preference (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      key TEXT,
      value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, key)
    );
  `);
  // Seed default flags if empty
  const count = await pool.query('SELECT COUNT(*) FROM ogo_feature_flag');
  if (parseInt(count.rows[0].count) === 0) {
    for (const f of DEFAULT_FLAGS) {
      await pool.query(
        'INSERT INTO ogo_feature_flag (feature, enabled) VALUES ($1, true) ON CONFLICT (feature) DO NOTHING',
        [f]
      );
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'feature-flags';
  const userId = searchParams.get('user_id') || 'demo_user';

  try {
    await ensureTables();

    if (type === 'feature-flags') {
      const res = await pool.query('SELECT * FROM ogo_feature_flag ORDER BY feature');
      return Response.json({ flags: res.rows });
    } else if (type === 'preferences') {
      const res = await pool.query(
        'SELECT key, value FROM ogo_user_preference WHERE user_id = $1',
        [userId]
      );
      const prefs: Record<string, string> = {};
      for (const row of res.rows) prefs[row.key] = row.value;
      return Response.json({ preferences: prefs, departments: DEPARTMENTS });
    }

    return Response.json({ error: 'Unknown type' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (type === 'feature-flags') {
      return Response.json({ flags: DEFAULT_FLAGS.map(f => ({ feature: f, enabled: true })), _mock: true, _reason: msg });
    }
    return Response.json({ preferences: {}, departments: DEPARTMENTS, _mock: true, _reason: msg });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables();
    const body = await request.json();
    const { type, key, value } = body;

    if (type === 'feature-flags') {
      await pool.query(
        `INSERT INTO ogo_feature_flag (feature, enabled, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (feature) DO UPDATE SET enabled = $2, updated_at = NOW()`,
        [key, value === true || value === 'true']
      );
      return Response.json({ ok: true });
    } else if (type === 'preferences') {
      const userId = body.user_id || 'demo_user';
      await pool.query(
        `INSERT INTO ogo_user_preference (user_id, key, value, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
        [userId, key, String(value)]
      );
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown type' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, _mock: true }, { status: 500 });
  }
}
