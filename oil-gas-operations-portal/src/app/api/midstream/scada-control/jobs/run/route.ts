export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureJobTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_job_run (id SERIAL PRIMARY KEY, job_name TEXT, dept TEXT, status TEXT, rows_processed INT DEFAULT 0, result_json JSONB, started_at TIMESTAMPTZ DEFAULT NOW(), finished_at TIMESTAMPTZ)`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureJobTable(client);
    const res = await client.query(`SELECT id, job_name, status, started_at, finished_at, rows_processed FROM ogo_job_run WHERE dept='midstream-scada-control' ORDER BY started_at DESC LIMIT 20`);
    return NextResponse.json({ history: res.rows });
  } catch (e: unknown) { return NextResponse.json({ history: [], error: String(e) }); }
  finally { client.release(); }
}

export async function POST(req: NextRequest) {
  const { job_id } = await req.json();
  const client = await pool.connect();
  try {
    await ensureJobTable(client);
    const ins = await client.query(`INSERT INTO ogo_job_run (job_name, dept, status) VALUES ($1,'midstream-scada-control','running') RETURNING id`, [job_id]);
    const runId = ins.rows[0].id;
    let resultJson: Record<string, unknown> = {};
    let rowsProcessed = 0;

    if (job_id === 'scada-anomaly-scan') {
      const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_scada_metric WHERE co>0.006 OR lpg>0.007`);
      rowsProcessed = parseInt(res.rows[0].cnt, 10);
      resultJson = { anomaly_count: rowsProcessed, thresholds: { co: '>0.006', lpg: '>0.007' } };
    } else if (job_id === 'scada-device-count') {
      const res = await client.query(`SELECT device, COUNT(*) AS readings FROM ogo_scada_metric GROUP BY device ORDER BY readings DESC`);
      rowsProcessed = res.rows.length;
      resultJson = { device_count: rowsProcessed, devices: res.rows };
    } else if (job_id === 'scada-alarm-rate') {
      const total = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_scada_metric`);
      const anomalies = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_scada_metric WHERE co>0.006 OR lpg>0.007`);
      const t = parseInt(total.rows[0].cnt, 10);
      const a = parseInt(anomalies.rows[0].cnt, 10);
      rowsProcessed = t;
      resultJson = { total_readings: t, anomaly_count: a, alert_rate_pct: t > 0 ? ((a / t) * 100).toFixed(2) : '0' };
    } else {
      resultJson = { message: `Unknown job: ${job_id}` };
    }

    // CSV row iteration: scada-control → iot-telemetry dataset
    const DATA_BASE_PATH = process.env.DATA_BASE_PATH ?? '/mnt/deepa/IoT/code/oil-gas-monitoring/data';
    const csvDir = path.join(DATA_BASE_PATH, 'kaggle/iot-telemetry');
    let csvRowsProcessed = 0;
    if (fs.existsSync(csvDir)) {
      const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));
      if (files.length > 0) {
        const csvPath = path.join(csvDir, files[0]);
        const content = fs.readFileSync(csvPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        for (const line of lines.slice(1, 201)) {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const _row: Record<string, string> = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
          void _row;
          csvRowsProcessed++;
        }
        resultJson = { ...resultJson, csv_file: files[0], csv_rows_processed: csvRowsProcessed };
        rowsProcessed = Math.max(rowsProcessed, csvRowsProcessed);
      }
    }

    await client.query(`UPDATE ogo_job_run SET status='success', finished_at=NOW(), rows_processed=$1, result_json=$2 WHERE id=$3`, [rowsProcessed, JSON.stringify(resultJson), runId]);
    return NextResponse.json({ status: 'success', job_id, rows_processed: rowsProcessed, result: resultJson });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}
