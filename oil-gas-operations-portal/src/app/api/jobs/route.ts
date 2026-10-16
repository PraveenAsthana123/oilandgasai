export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (
      id SERIAL PRIMARY KEY, job_name TEXT, dataset TEXT, status TEXT DEFAULT 'pending',
      started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, result JSONB, error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    const result = await pool.query(
      'SELECT * FROM ogo_job_run ORDER BY created_at DESC LIMIT 100'
    );
    return Response.json({ runs: result.rows, total: result.rowCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, runs: [] }, { status: 500 });
  }
}

export async function POST() {
  // Ensure all new tables exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_dept_use_case (id SERIAL PRIMARY KEY, dept_slug TEXT, use_case_name TEXT, ai_type TEXT, pain_point TEXT, data_source TEXT, model_type TEXT, expected_output TEXT, status TEXT DEFAULT 'planned', created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS ogo_dept_brd (id SERIAL PRIMARY KEY, dept_slug TEXT, section TEXT, content TEXT, priority TEXT DEFAULT 'must_have', created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS ogo_bot_session (id SERIAL PRIMARY KEY, session_id TEXT, role TEXT, content TEXT, dept_tag TEXT, stream TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, source TEXT, chunk_text TEXT, chunk_index INT, dept_tag TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, dataset TEXT, status TEXT DEFAULT 'pending', started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, result JSONB, error TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS ogo_ai_incident (id SERIAL PRIMARY KEY, model_name TEXT, incident_type TEXT, description TEXT, severity TEXT, status TEXT DEFAULT 'open', reported_at TIMESTAMPTZ DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS ogo_generated_content (id SERIAL PRIMARY KEY, content_type TEXT, prompt TEXT, result TEXT, model TEXT, generation_ms INT, created_at TIMESTAMPTZ DEFAULT NOW());
    `);
    return Response.json({ ok: true, message: 'New tables created/verified' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
