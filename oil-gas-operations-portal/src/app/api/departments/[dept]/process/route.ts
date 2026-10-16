export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

// Department process metadata — process_id, stream, AI model count, sub-process count, KPI list
const DEPT_PROCESS_META: Record<string, {
  process_id: string;
  title: string;
  stream: string;
  stepCount: number;
  subProcessCount: number;
  aiModelCount: number;
  primaryKpis: string[];
  status: string;
}> = {
  'exploration-geology': { process_id: 'P-UP-01', title: 'Exploration & Geoscience Process', stream: 'Upstream', stepCount: 6, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['Prospect count (risked NPV > $50MM)', 'Drilling success rate %', 'Discovery cost $/boe'], status: 'active' },
  'drilling-engineering': { process_id: 'P-UP-02', title: 'Drilling & Well Construction Process', stream: 'Upstream', stepCount: 6, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['NPT % (target < 10%)', 'Cost/metre drilled', 'Well delivery on time %'], status: 'active' },
  'reservoir-engineering': { process_id: 'P-UP-03', title: 'Reservoir Management Process', stream: 'Upstream', stepCount: 6, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['Reserve replacement ratio', 'Recovery factor %', 'Forecast accuracy (1-yr MAPE)'], status: 'active' },
  'production-engineering': { process_id: 'P-UP-04', title: 'Production Operations Process', stream: 'Upstream', stepCount: 6, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['Production boe/d', 'Operating cost $/boe', 'Production efficiency %'], status: 'active' },
  'well-completion': { process_id: 'P-UP-05', title: 'Well Completion Process', stream: 'Upstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Frac design accuracy %', 'EUR per stage (boe)', 'Flowback recovery %'], status: 'active' },
  'well-integrity': { process_id: 'P-UP-06', title: 'Well Integrity Process', stream: 'Upstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Barrier failure rate per 1000 wells', 'DHSV test pass rate %', 'P&A cost per well'], status: 'active' },
  'hse-safety': { process_id: 'P-ALL-01', title: 'HSE Management Process', stream: 'All Streams', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['TRIR (total recordable incident rate)', 'LTIF (lost time injury frequency)', 'Process safety events (Tier 1)'], status: 'active' },
  'pipeline-integrity': { process_id: 'P-MID-01', title: 'Pipeline Integrity Management Process', stream: 'Midstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['ILI coverage % per inspection cycle', 'Remediations on schedule %', 'Failure rate per 1000 km/yr'], status: 'active' },
  'pipeline-operations': { process_id: 'P-MID-02', title: 'Pipeline Operations Process', stream: 'Midstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['System reliability %', 'Throughput utilization %', 'Leak detection time (hrs)'], status: 'active' },
  'compression': { process_id: 'P-MID-03', title: 'Compression & Gathering Process', stream: 'Midstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Compressor availability %', 'Specific energy kWh/Mscf', 'Surge events per month'], status: 'active' },
  'gas-processing': { process_id: 'P-MID-04', title: 'Gas Processing Plant Process', stream: 'Midstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['NGL recovery efficiency %', 'H2S in sales gas ppm', 'Amine circulation rate L/Mscf'], status: 'active' },
  'storage': { process_id: 'P-MID-05', title: 'Storage Operations Process', stream: 'Midstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Tank inventory accuracy %', 'Evaporation loss bbl/day', 'Custody transfer error %'], status: 'active' },
  'scada-control': { process_id: 'P-MID-06', title: 'SCADA & Control Process', stream: 'Midstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Alarm rate per operator-hr (< 12)', 'SCADA uptime %', 'Cybersecurity MTTD hrs'], status: 'active' },
  'metering': { process_id: 'P-MID-07', title: 'Custody Transfer Metering Process', stream: 'Midstream', stepCount: 6, subProcessCount: 4, aiModelCount: 3, primaryKpis: ['Meter uncertainty ±%', 'Unaccounted-for gas %', 'Prover frequency compliance %'], status: 'active' },
  'refinery-operations': { process_id: 'P-DS-01', title: 'Refinery Operations Process', stream: 'Downstream', stepCount: 6, subProcessCount: 6, aiModelCount: 4, primaryKpis: ['CDU throughput utilization %', 'Energy intensity kJ/bbl', 'Unplanned outage hours/month'], status: 'active' },
  'process-engineering': { process_id: 'P-DS-02', title: 'Process Optimization Process', stream: 'Downstream', stepCount: 4, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['Refinery margin $/bbl', 'APC uptime %', 'LP solve frequency/day'], status: 'active' },
  'product-quality': { process_id: 'P-DS-03', title: 'Product Quality Control Process', stream: 'Downstream', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Spec compliance %', 'Lab TAT hrs', 'Out-of-spec events/month'], status: 'active' },
  'maintenance': { process_id: 'P-ALL-02', title: 'Maintenance Management Process', stream: 'All Streams', stepCount: 6, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['MTBF (mean time between failures)', 'Planned maintenance % (target > 80%)', 'Maintenance cost $/boe'], status: 'active' },
  'distribution': { process_id: 'P-DS-04', title: 'Product Distribution Process', stream: 'Downstream', stepCount: 4, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Loading rack utilization %', 'On-time delivery %', 'Truck queue time min'], status: 'active' },
  'commercial-trading': { process_id: 'P-DS-05', title: 'Commercial & Trading Process', stream: 'Downstream', stepCount: 4, subProcessCount: 5, aiModelCount: 6, primaryKpis: ['Gross margin $/bbl', 'Crack spread $/bbl', 'Forecast price accuracy MAPE'], status: 'active' },
  'environmental': { process_id: 'P-ALL-03', title: 'Environmental Compliance Process', stream: 'All Streams', stepCount: 4, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['Regulatory exceedances count', 'GHG intensity tCO2e/boe', 'Permit compliance %'], status: 'active' },
  'procurement': { process_id: 'P-ALL-04', title: 'Procurement & Supply Chain Process', stream: 'All Streams', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['Savings vs budget %', 'PO cycle time days', 'Vendor delivery on-time %'], status: 'active' },
  'it-digital': { process_id: 'P-ALL-05', title: 'IT/OT Digital Operations Process', stream: 'All Streams', stepCount: 6, subProcessCount: 5, aiModelCount: 4, primaryKpis: ['System availability %', 'MTTD cybersecurity hrs', 'Model deployment success rate %'], status: 'active' },
  'data-science-ai': { process_id: 'P-ALL-06', title: 'Data Science & AI Process', stream: 'All Streams', stepCount: 6, subProcessCount: 5, aiModelCount: 5, primaryKpis: ['Model accuracy improvement vs baseline %', 'Time to production (days)', 'Models in production count'], status: 'active' },
};

async function ensureTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ogo_process (
        id SERIAL PRIMARY KEY,
        process_id TEXT UNIQUE,
        stream TEXT,
        department TEXT,
        process_name TEXT,
        step_count INT,
        sub_process_count INT,
        status TEXT DEFAULT 'active',
        ai_models JSONB,
        kpis JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}

export async function GET(req: Request, { params }: { params: { dept: string } }) {
  const { dept } = params;
  const meta = DEPT_PROCESS_META[dept];

  if (!meta) {
    return Response.json({
      error: `No process metadata for department: ${dept}`,
      available: Object.keys(DEPT_PROCESS_META),
    }, { status: 404 });
  }

  try {
    await ensureTable();
    const client = await pool.connect();
    try {
      // Upsert this department process into ogo_process
      await client.query(
        `INSERT INTO ogo_process (process_id, stream, department, process_name, step_count, sub_process_count, status, ai_models, kpis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (process_id) DO NOTHING`,
        [meta.process_id, meta.stream, dept, meta.title, meta.stepCount, meta.subProcessCount, meta.status,
          JSON.stringify([]), JSON.stringify(meta.primaryKpis)]
      );

      const { rows } = await client.query(
        'SELECT * FROM ogo_process WHERE process_id = $1',
        [meta.process_id]
      );

      return Response.json({
        dept,
        meta,
        db_record: rows[0] ?? null,
        _source: 'db',
      });
    } finally {
      client.release();
    }
  } catch (err) {
    return Response.json({
      dept,
      meta,
      db_record: null,
      _source: 'static_fallback',
      _error: String(err),
    });
  }
}
