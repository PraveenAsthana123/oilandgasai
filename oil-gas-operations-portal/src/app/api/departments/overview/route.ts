export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface DeptConfig {
  slug: string;
  name: string;
  stream: 'upstream' | 'midstream' | 'downstream' | 'cross-cutting';
  table: string;
}

const DEPARTMENTS: DeptConfig[] = [
  // Upstream
  { slug: 'exploration-geology',      name: 'Exploration & Geology',      stream: 'upstream',       table: 'ogo_exp_metric' },
  { slug: 'drilling-engineering',     name: 'Drilling Engineering',       stream: 'upstream',       table: 'ogo_drill_metric' },
  { slug: 'reservoir-engineering',    name: 'Reservoir Engineering',      stream: 'upstream',       table: 'ogo_rsv_metric' },
  { slug: 'production-engineering',   name: 'Production Engineering',     stream: 'upstream',       table: 'ogo_prod_metric' },
  { slug: 'well-integrity',           name: 'Well Integrity',             stream: 'upstream',       table: 'ogo_wi_metric' },
  { slug: 'hse-safety',               name: 'HSE & Safety',               stream: 'upstream',       table: 'ogo_hse_metric' },
  // Midstream
  { slug: 'pipeline-integrity',       name: 'Pipeline Integrity',         stream: 'midstream',      table: 'ogo_pipe_metric' },
  { slug: 'gas-compression',          name: 'Gas Compression',            stream: 'midstream',      table: 'ogo_iot_metric' },
  { slug: 'gas-processing',           name: 'Gas Processing',             stream: 'midstream',      table: 'ogo_gasdem_metric' },
  { slug: 'storage-operations',       name: 'Storage Operations',         stream: 'midstream',      table: 'ogo_storage_metric' },
  { slug: 'scada-control',            name: 'SCADA Control',              stream: 'midstream',      table: 'ogo_scada_metric' },
  { slug: 'custody-metering',         name: 'Custody Metering',           stream: 'midstream',      table: 'ogo_metering_metric' },
  // Downstream
  { slug: 'refining-operations',      name: 'Refining Operations',        stream: 'downstream',     table: 'ogo_refine_metric' },
  { slug: 'process-engineering',      name: 'Process Engineering',        stream: 'downstream',     table: 'ogo_process_metric' },
  { slug: 'quality-control',          name: 'Quality Control',            stream: 'downstream',     table: 'ogo_quality_metric' },
  { slug: 'distribution-logistics',   name: 'Distribution & Logistics',   stream: 'downstream',     table: 'ogo_logistics_metric' },
  { slug: 'crude-trading',            name: 'Crude Trading',              stream: 'downstream',     table: 'ogo_trading_metric' },
  { slug: 'environmental-compliance', name: 'Environmental Compliance',   stream: 'downstream',     table: 'ogo_enviro_metric' },
  // Cross-cutting (no dedicated metric table — use proxy)
  { slug: 'data-science-ai',          name: 'Data Science & AI',          stream: 'cross-cutting',  table: 'ogo_bot_log' },
  { slug: 'mechanical-maintenance',   name: 'Mechanical Maintenance',     stream: 'cross-cutting',  table: 'ogo_drill_metric' },
  { slug: 'petroleum-economics',      name: 'Petroleum Economics',        stream: 'cross-cutting',  table: 'ogo_trading_metric' },
  { slug: 'regulatory-affairs',       name: 'Regulatory Affairs',         stream: 'cross-cutting',  table: 'ogo_hse_metric' },
  { slug: 'project-management',       name: 'Project Management',         stream: 'cross-cutting',  table: 'ogo_job_run' },
  { slug: 'procurement',              name: 'Procurement',                stream: 'cross-cutting',  table: 'ogo_vendor' },
];

async function safeCount(table: string): Promise<number> {
  try {
    const res = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`);
    return parseInt(res.rows[0]?.c ?? '0', 10);
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    // Job run aggregates
    const jobMap: Record<string, { last_run: string | null; rows: number }> = {};
    try {
      const jr = await pool.query(
        `SELECT job_name, MAX(completed_at) AS last_run, COALESCE(SUM(rows_processed),0) AS total
         FROM ogo_job_run GROUP BY job_name`
      );
      for (const row of jr.rows) {
        jobMap[row.job_name] = { last_run: row.last_run, rows: parseInt(row.total, 10) };
      }
    } catch { /* table may not exist yet */ }

    // RAG chunk counts by dept
    const ragMap: Record<string, number> = {};
    try {
      const rag = await pool.query(
        `SELECT dept, COUNT(*) AS chunk_count FROM ogo_rag_chunk GROUP BY dept`
      );
      for (const row of rag.rows) {
        ragMap[row.dept] = parseInt(row.chunk_count, 10);
      }
    } catch { /* table may not exist yet */ }

    // Bot log counts by dept
    const botMap: Record<string, number> = {};
    try {
      const bot = await pool.query(
        `SELECT dept, COUNT(*) AS query_count FROM ogo_bot_log GROUP BY dept`
      );
      for (const row of bot.rows) {
        botMap[row.dept] = parseInt(row.query_count, 10);
      }
    } catch { /* table may not exist yet */ }

    // Per-department metric counts (parallel)
    const metricCounts = await Promise.all(
      DEPARTMENTS.map((d) => safeCount(d.table))
    );

    const departments = DEPARTMENTS.map((d, i) => {
      // Try to find a matching job for this dept via slug prefix
      const slugKey = d.slug.replace(/-/g, '_');
      const matchedJob = Object.entries(jobMap).find(([k]) =>
        k.includes(slugKey) || k.includes(d.slug)
      );
      return {
        slug: d.slug,
        name: d.name,
        stream: d.stream,
        metric_count: metricCounts[i],
        last_job_run: matchedJob?.[1].last_run ?? null,
        rag_chunks: ragMap[d.slug] ?? 0,
        bot_queries: botMap[d.slug] ?? 0,
      };
    });

    // Overall KPIs
    let jobs_running = 0;
    try {
      const jr = await pool.query(
        `SELECT COUNT(*) AS c FROM ogo_job_run WHERE status = 'running'`
      );
      jobs_running = parseInt(jr.rows[0]?.c ?? '0', 10);
    } catch { /* ignore */ }

    let avg_bot_usage = 0;
    try {
      const bl = await pool.query(
        `SELECT COALESCE(COUNT(*),0) AS c FROM ogo_bot_log`
      );
      const total = parseInt(bl.rows[0]?.c ?? '0', 10);
      avg_bot_usage = total > 0 ? Math.round(total / DEPARTMENTS.length) : 0;
    } catch { /* ignore */ }

    const data_imported = departments.filter((d) => d.metric_count > 0).length;

    return NextResponse.json({
      kpis: {
        total_departments: 24,
        data_imported,
        jobs_running,
        avg_bot_usage,
      },
      departments,
    });
  } catch (err) {
    console.error('[departments/overview]', err);
    return NextResponse.json({ error: 'Failed to load overview' }, { status: 500 });
  }
}
