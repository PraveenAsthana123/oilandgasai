export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

const DATA_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring';
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

async function runJ01(): Promise<Record<string, unknown>> {
  const csv = fs.readFileSync(path.join(DATA_PATH, 'data/kaggle/pipeline-maintenance/content/market_pipe_thickness_loss_dataset.csv'), 'utf-8');
  const rows = parseCSV(csv);

  const byMaterial: Record<string, { corr: number[]; count: number }> = {};
  const conditionCount: Record<string, number> = {};
  const thicknessDist: Record<string, number> = { '0-5': 0, '5-15': 0, '15-30': 0, '30+': 0 };

  for (const r of rows) {
    const mat = r['Material'] || r['material'] || 'Unknown';
    const corr = parseFloat(r['Corrosion_Impact_Percent'] || r['corrosion_impact_percent'] || '0');
    const cond = r['Condition'] || r['condition'] || 'Unknown';

    if (!byMaterial[mat]) byMaterial[mat] = { corr: [], count: 0 };
    byMaterial[mat].corr.push(corr);
    byMaterial[mat].count++;
    conditionCount[cond] = (conditionCount[cond] || 0) + 1;

    if (corr < 5) thicknessDist['0-5']++;
    else if (corr < 15) thicknessDist['5-15']++;
    else if (corr < 30) thicknessDist['15-30']++;
    else thicknessDist['30+']++;
  }

  const avgCorrByMaterial = Object.fromEntries(
    Object.entries(byMaterial).map(([m, v]) => [m, parseFloat((v.corr.reduce((a, b) => a + b, 0) / v.corr.length).toFixed(2))])
  );

  const total = rows.length;
  const conditionPct = Object.fromEntries(
    Object.entries(conditionCount).map(([k, v]) => [k, `${((v / total) * 100).toFixed(1)}%`])
  );

  return {
    total_records: total,
    avg_corrosion_by_material: avgCorrByMaterial,
    condition_distribution: conditionPct,
    thickness_loss_distribution: thicknessDist,
    summary: `Analyzed ${total} pipeline records. Most critical material: ${
      Object.entries(avgCorrByMaterial).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'
    }`,
  };
}

async function runJ02(): Promise<Record<string, unknown>> {
  const csv = fs.readFileSync(path.join(DATA_PATH, 'data/kaggle/machine-maintenance/content/predictive_maintenance.csv'), 'utf-8');
  const rows = parseCSV(csv);

  const failureTypes: Record<string, number> = {};
  const wearAtFailure: number[] = [];
  const tempAll: number[] = [];
  const tempFail: number[] = [];

  for (const r of rows) {
    const ft = r['Failure Type'] || r['failure_type'] || 'No Failure';
    failureTypes[ft] = (failureTypes[ft] || 0) + 1;
    const target = parseInt(r['Target'] || r['target'] || '0');
    const wear = parseFloat(r['Tool wear [min]'] || r['tool_wear'] || '0');
    const temp = parseFloat(r['Air temperature [K]'] || r['air_temp'] || '0');
    if (target === 1) wearAtFailure.push(wear);
    tempAll.push(temp);
    if (target === 1) tempFail.push(temp);
  }

  const avgWear = wearAtFailure.length ? wearAtFailure.reduce((a, b) => a + b, 0) / wearAtFailure.length : 0;

  const targets = rows.map(r => parseInt(r['Target'] || '0'));
  const temps = rows.map(r => parseFloat(r['Air temperature [K]'] || '0'));
  const r = pearsonCorrelation(temps, targets);

  return {
    total_records: rows.length,
    failure_type_frequency: failureTypes,
    avg_tool_wear_at_failure_min: parseFloat(avgWear.toFixed(1)),
    temp_failure_correlation_r: parseFloat(r.toFixed(3)),
    failure_count: wearAtFailure.length,
    summary: `${rows.length} maintenance records. ${wearAtFailure.length} failures detected. Avg tool wear at failure: ${avgWear.toFixed(1)} min. Temp-failure correlation r=${r.toFixed(3)}.`,
  };
}

async function runJ03(): Promise<Record<string, unknown>> {
  const csv = fs.readFileSync(path.join(DATA_PATH, 'data/kaggle/environmental-telemetry/content/iot_telemetry_data.csv'), 'utf-8');
  const rows = parseCSV(csv).slice(-100);

  const deviceStats: Record<string, { co: number[]; lpg: number[]; temp: number[] }> = {};
  const alerts: { ts: string; device: string; metric: string; value: number; threshold: number }[] = [];

  for (const r of rows) {
    const dev = r['device'] || r['Device'] || 'unknown';
    const co = parseFloat(r['co'] || '0');
    const lpg = parseFloat(r['lpg'] || '0');
    const temp = parseFloat(r['temp'] || '0');
    const ts = r['ts'] || r['timestamp'] || '';

    if (!deviceStats[dev]) deviceStats[dev] = { co: [], lpg: [], temp: [] };
    deviceStats[dev].co.push(co);
    deviceStats[dev].lpg.push(lpg);
    deviceStats[dev].temp.push(temp);

    if (co > 0.01) alerts.push({ ts, device: dev, metric: 'CO', value: parseFloat(co.toFixed(4)), threshold: 0.01 });
    if (lpg > 0.01) alerts.push({ ts, device: dev, metric: 'LPG', value: parseFloat(lpg.toFixed(4)), threshold: 0.01 });
  }

  const avg = (arr: number[]) => arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4)) : 0;
  const deviceAvg = Object.fromEntries(
    Object.entries(deviceStats).map(([d, v]) => [d, { co: avg(v.co), lpg: avg(v.lpg), temp: avg(v.temp) }])
  );

  return {
    records_analyzed: rows.length,
    device_averages: deviceAvg,
    threshold_alerts: alerts.slice(0, 20),
    alert_count: alerts.length,
    summary: `Last 100 IoT readings. ${Object.keys(deviceStats).length} devices. ${alerts.length} threshold exceedances (CO>0.01 or LPG>0.01).`,
  };
}

async function runJ04(): Promise<Record<string, unknown>> {
  const csv = fs.readFileSync(path.join(DATA_PATH, 'data/kaggle/pipeline-accidents/content/database.csv'), 'utf-8');
  const rows = parseCSV(csv);

  const causeCounts: Record<string, number> = {};
  const stateCounts: Record<string, number> = {};
  const barrels: number[] = [];

  for (const r of rows) {
    const cause = r['CAUSE'] || r['cause'] || r['Cause'] || 'Unknown';
    const state = r['STATE'] || r['state'] || r['State'] || 'Unknown';
    const bbl = parseFloat(r['NET LOSS (BARRELS)'] || r['net_loss'] || r['TOTAL NET LOSS'] || '0');

    causeCounts[cause] = (causeCounts[cause] || 0) + 1;
    stateCounts[state] = (stateCounts[state] || 0) + 1;
    if (!isNaN(bbl)) barrels.push(bbl);
  }

  const top5Causes = Object.entries(causeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const top10States = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const avgBarrels = barrels.length ? barrels.reduce((a, b) => a + b, 0) / barrels.length : 0;

  return {
    total_incidents: rows.length,
    top_5_causes: top5Causes,
    top_10_states_by_incidents: top10States,
    avg_barrels_released: parseFloat(avgBarrels.toFixed(2)),
    summary: `${rows.length} pipeline incidents analyzed. Top cause: ${top5Causes[0]?.[0]}. Avg release: ${avgBarrels.toFixed(0)} barrels.`,
  };
}

async function runJ05(): Promise<Record<string, unknown>> {
  const csv = fs.readFileSync(path.join(DATA_PATH, 'data/kaggle/production-trends/content/OGORBcsv_cleaned.csv'), 'utf-8');
  const rows = parseCSV(csv).slice(0, 1000);

  const byCommodity: Record<string, number> = {};
  const byState: Record<string, number> = {};

  for (const r of rows) {
    const commodity = r['Commodity'] || r['commodity'] || r['COMMODITY'] || 'Unknown';
    const state = r['State'] || r['state'] || r['STATE'] || 'Unknown';
    const vol = parseFloat(r['Volume'] || r['volume'] || r['VOLUME'] || r['Production'] || '0');

    byCommodity[commodity] = (byCommodity[commodity] || 0) + (isNaN(vol) ? 1 : vol);
    byState[state] = (byState[state] || 0) + (isNaN(vol) ? 1 : vol);
  }

  const top5States = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    records_analyzed: rows.length,
    volume_by_commodity: byCommodity,
    top_5_states_by_production: top5States,
    summary: `${rows.length} production records. Commodities: ${Object.keys(byCommodity).join(', ')}. Top state: ${top5States[0]?.[0]}.`,
  };
}

async function runJ06(): Promise<Record<string, unknown>> {
  // Get latest J02 result
  const latestJ02 = await pool.query(
    `SELECT result FROM ogo_job_run WHERE job_name = 'Equipment Failure Classification' AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`
  ).catch(() => ({ rows: [] as Record<string, unknown>[] }));

  const j02Summary = latestJ02.rows[0]?.result
    ? JSON.stringify(latestJ02.rows[0].result).slice(0, 800)
    : 'No prior equipment failure analysis available. Equipment failure data analysis pending.';

  const prompt = `Based on this equipment failure analysis data: ${j02Summary}\n\nGenerate a 3-paragraph predictive maintenance report with: 1) Key findings from the failure analysis, 2) Risk assessment and priority equipment to monitor, 3) Specific maintenance recommendations with implementation timeline. Be concise and actionable.`;

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(60000),
    });

    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json() as { response?: string; error?: string };

    return {
      report: data.response ?? 'No response from Ollama',
      model: 'llama3.2',
      based_on_j02: !!latestJ02.rows[0],
    };
  } catch (e) {
    return {
      report: '⚠️ Ollama unavailable — Set OLLAMA_URL and ensure Ollama is running to generate AI maintenance reports.',
      model: 'unavailable',
      error: String(e),
      _mock: true,
    };
  }
}

async function runJ07(): Promise<Record<string, unknown>> {
  const incidents = await pool.query(
    `SELECT incident_type, severity, location, reported_at FROM ogo_incident WHERE reported_at > NOW() - INTERVAL '7 days' ORDER BY reported_at DESC LIMIT 20`
  ).catch(() => ({ rows: [] as Record<string, unknown>[], rowCount: 0 }));

  const summary = incidents.rows.length > 0
    ? incidents.rows.map(r => `${r.severity?.toUpperCase()} - ${r.incident_type} at ${r.location}`).join('; ')
    : 'No incidents in the last 7 days.';

  const prompt = `You are a safety coordinator for an oil & gas facility. Generate a concise daily safety briefing based on these recent incidents: ${summary}\n\nInclude: 1) Safety status overview, 2) Key risks to watch today, 3) Recommended safety actions for shift teams. Keep it under 200 words.`;

  try {
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', prompt, stream: false }),
      signal: AbortSignal.timeout(45000),
    });

    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const data = await resp.json() as { response?: string };

    return {
      briefing: data.response ?? 'No response',
      incident_count: incidents.rows.length,
      model: 'llama3.2',
    };
  } catch (e) {
    return {
      briefing: '⚠️ Ollama unavailable — Set OLLAMA_URL to generate AI safety briefings.',
      incident_count: incidents.rows.length,
      model: 'unavailable',
      _mock: true,
      error: String(e),
    };
  }
}

const JOB_REGISTRY: Record<string, { name: string; dataset: string; fn: () => Promise<Record<string, unknown>> }> = {
  'J01': { name: 'Pipeline Corrosion Analysis', dataset: 'pipeline-maintenance/market_pipe_thickness_loss_dataset.csv', fn: runJ01 },
  'J02': { name: 'Equipment Failure Classification', dataset: 'machine-maintenance/predictive_maintenance.csv', fn: runJ02 },
  'J03': { name: 'Environmental Sensor Replay', dataset: 'environmental-telemetry/iot_telemetry_data.csv', fn: runJ03 },
  'J04': { name: 'Pipeline Incident Analysis', dataset: 'pipeline-accidents/database.csv', fn: runJ04 },
  'J05': { name: 'Production Trend Analysis', dataset: 'production-trends/OGORBcsv_cleaned.csv', fn: runJ05 },
  'J06': { name: 'Ollama Maintenance Report', dataset: 'J02 results + Ollama', fn: runJ06 },
  'J07': { name: 'Daily Safety Briefing', dataset: 'ogo_incident table + Ollama', fn: runJ07 },
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const job = JOB_REGISTRY[id];
  if (!job) return Response.json({ error: `Unknown job ID: ${id}` }, { status: 404 });

  await pool.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (
    id SERIAL PRIMARY KEY, job_name TEXT, dataset TEXT, status TEXT DEFAULT 'pending',
    started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, result JSONB, error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  const startTs = new Date().toISOString();
  const runInsert = await pool.query(
    `INSERT INTO ogo_job_run (job_name, dataset, status, started_at) VALUES ($1, $2, 'running', $3) RETURNING id`,
    [job.name, job.dataset, startTs]
  );
  const runId = runInsert.rows[0].id;

  try {
    const result = await job.fn();
    const endTs = new Date().toISOString();

    await pool.query(
      `UPDATE ogo_job_run SET status='completed', completed_at=$1, result=$2 WHERE id=$3`,
      [endTs, JSON.stringify(result), runId]
    );

    return Response.json({ ok: true, run_id: runId, job_name: job.name, result, started_at: startTs, completed_at: endTs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await pool.query(
      `UPDATE ogo_job_run SET status='failed', completed_at=$1, error=$2 WHERE id=$3`,
      [new Date().toISOString(), msg, runId]
    );
    return Response.json({ ok: false, run_id: runId, error: msg }, { status: 500 });
  }
}
