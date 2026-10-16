export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const stream = url.searchParams.get('stream') ?? '';
  const severity = url.searchParams.get('severity') ?? '';
  const source = url.searchParams.get('source') ?? 'all';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '500'), 500);

  try {
    // Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_agent_task (
        id SERIAL PRIMARY KEY, agent_name TEXT, goal TEXT, status TEXT,
        stream TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogo_job_run (
        id SERIAL PRIMARY KEY, job_name TEXT, dataset TEXT, status TEXT DEFAULT 'pending',
        started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, result JSONB, error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogo_incident (
        id SERIAL PRIMARY KEY, incident_type TEXT, severity TEXT, location TEXT,
        description TEXT, stream TEXT, reported_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    let sql = `
      SELECT 'agent' as source, created_at as ts, COALESCE(status, 'info') as level,
             COALESCE(agent_name, 'Agent') as msg, COALESCE(goal, '') as detail,
             COALESCE(stream, '') as stream
      FROM ogo_agent_task
      UNION ALL
      SELECT 'job' as source, created_at as ts, COALESCE(status, 'info') as level,
             COALESCE(job_name, 'Job') as msg, COALESCE(dataset, '') as detail,
             '' as stream
      FROM ogo_job_run
      UNION ALL
      SELECT 'incident' as source, reported_at as ts, COALESCE(severity, 'warning') as level,
             COALESCE(incident_type, 'Incident') as msg, COALESCE(location, '') as detail,
             COALESCE(stream, '') as stream
      FROM ogo_incident
    `;

    const conditions: string[] = [];
    if (source !== 'all') conditions.push(`source = '${source.replace(/'/g, '')}'`);
    if (severity) conditions.push(`level = '${severity.replace(/'/g, '')}'`);
    if (stream) conditions.push(`stream = '${stream.replace(/'/g, '')}'`);

    const finalSql = `
      SELECT * FROM (${sql}) logs
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
      ORDER BY ts DESC NULLS LAST LIMIT ${limit}
    `;

    const result = await pool.query(finalSql);
    return Response.json({ logs: result.rows, total: result.rowCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, logs: [], total: 0 }, { status: 500 });
  }
}
