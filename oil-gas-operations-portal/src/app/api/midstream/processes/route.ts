export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';
import { NextResponse } from 'next/server';

async function ensureTables() {
  await pool.query(`
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
    CREATE TABLE IF NOT EXISTS ogo_process_step (
      id SERIAL PRIMARY KEY,
      process_id TEXT,
      step_number INT,
      step_name TEXT,
      inputs TEXT,
      activities TEXT,
      outputs TEXT,
      ai_integration TEXT,
      kpis TEXT,
      equipment TEXT,
      duration_typical TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

const MIDSTREAM_PROCESSES = [
  {
    process_id: 'P-MS-01',
    stream: 'midstream',
    department: 'Gathering & Field Operations',
    process_name: 'Gathering & Field Operations',
    step_count: 4,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Continuous',
    ai_models: ['Surge Detector', 'Valve Health Monitor', 'Speed Optimizer', 'TEG Circulation Optimizer', 'Glycol Loss Predictor'],
    detail_url: '/midstream/compression/process',
    sub_processes: ['Wellhead tie-in', 'Gathering system', 'Field dehydration', 'Field compression', 'Slug catcher', 'Gas lift supply'],
  },
  {
    process_id: 'P-MS-02',
    stream: 'midstream',
    department: 'Gas Processing Plant',
    process_name: 'Gas Processing Plant',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Continuous',
    ai_models: ['Amine Optimization', 'H2S Breakthrough Predictor', 'Recovery Optimizer', 'Hydrate Predictor', 'Column Stability Monitor', 'Product Spec Predictor'],
    detail_url: '/midstream/gas-processing/process',
    sub_processes: ['Inlet separation', 'Dehydration (glycol/mol sieve)', 'Acid gas removal (amine)', 'NGL extraction (cryogenic/absorption)', 'Fractionation', 'Sulphur recovery'],
  },
  {
    process_id: 'P-MS-03',
    stream: 'midstream',
    department: 'Pipeline Operations',
    process_name: 'Pipeline Transmission',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Continuous',
    ai_models: ['Quality Predictor', 'Volume Anomaly Detector', 'Vibration Anomaly Detector', 'Efficiency Optimizer', 'Predictive Maintenance', 'ILI Data Analyzer', 'Pig Run Scheduler', 'Leak Detection System', 'Delivery Scheduler', 'Meter Drift Predictor'],
    detail_url: '/midstream/pipeline/process',
    sub_processes: ['Batch scheduling', 'Pig launchers/receivers', 'Mainline pumping/compression', 'SCADA monitoring', 'Leak detection', 'Emergency shutdown'],
  },
  {
    process_id: 'P-MS-04',
    stream: 'midstream',
    department: 'Pipeline Integrity',
    process_name: 'Pipeline Integrity Management',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: '12-24 months/cycle',
    ai_models: ['ILI Data Analyzer', 'Pig Tracking AI', 'Alarm Rationalization', 'Anomaly Detection', 'Process Variable Forecasting', 'Cybersecurity Anomaly Detection'],
    detail_url: '/midstream/scada/process',
    sub_processes: ['ILI (smart pig)', 'ECDA', 'CP monitoring', 'Anomaly assessment', 'Defect repair', 'Pressure testing'],
  },
  {
    process_id: 'P-MS-05',
    stream: 'midstream',
    department: 'Storage Operations',
    process_name: 'Storage Operations',
    step_count: 5,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Continuous',
    ai_models: ['Inventory Level Optimizer', 'Evaporation Loss Predictor'],
    detail_url: '/midstream/storage/process',
    sub_processes: ['Cavern cycling', 'Tank farm management', 'Inventory optimization', 'Stratification monitoring', 'Vapor recovery', 'Drawdown operations'],
  },
  {
    process_id: 'P-MS-06',
    stream: 'midstream',
    department: 'Metering & Custody Transfer',
    process_name: 'Metering & Custody Transfer',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Monthly/Quarterly',
    ai_models: ['Meter Drift Predictor', 'Uncertainty Analyzer'],
    detail_url: '/midstream/metering/process',
    sub_processes: ['Flow computer calibration', 'Volume calculation', 'Quality analysis', 'Statements of measurement', 'Dispute resolution', 'Regulatory reporting'],
  },
];

export async function GET() {
  try {
    await ensureTables();

    for (const p of MIDSTREAM_PROCESSES) {
      await pool.query(
        `INSERT INTO ogo_process (process_id, stream, department, process_name, step_count, sub_process_count, status, ai_models, kpis)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (process_id) DO UPDATE SET
           process_name = EXCLUDED.process_name,
           step_count = EXCLUDED.step_count,
           sub_process_count = EXCLUDED.sub_process_count,
           status = EXCLUDED.status,
           ai_models = EXCLUDED.ai_models`,
        [
          p.process_id, p.stream, p.department, p.process_name,
          p.step_count, p.sub_process_count, p.status,
          JSON.stringify(p.ai_models), JSON.stringify({}),
        ]
      );
    }

    const result = await pool.query(
      `SELECT * FROM ogo_process WHERE stream = 'midstream' ORDER BY process_id`
    );

    return NextResponse.json({
      processes: result.rows,
      enriched: MIDSTREAM_PROCESSES,
      total: result.rows.length,
      _source: 'db',
    });
  } catch (err) {
    console.error('ogo_process midstream GET error:', err);
    return NextResponse.json({
      processes: [],
      enriched: MIDSTREAM_PROCESSES,
      total: MIDSTREAM_PROCESSES.length,
      _source: 'fallback',
      _error: String(err),
    });
  }
}
