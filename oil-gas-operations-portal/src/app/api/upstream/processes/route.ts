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
    CREATE TABLE IF NOT EXISTS ogo_process_run (
      id SERIAL PRIMARY KEY,
      process_id TEXT,
      step_id INT,
      status TEXT DEFAULT 'pending',
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      operator_id TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

const UPSTREAM_PROCESSES = [
  {
    process_id: 'P-US-01',
    stream: 'upstream',
    department: 'Exploration & Geoscience',
    process_name: 'Exploration & Geoscience',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: '6-18 months',
    ai_models: ['DL Seismic Denoiser', 'FWI Velocity Builder', 'CNN Horizon Picker', 'Fault Detection CNN', 'Portfolio EMV Optimizer'],
    detail_url: '/upstream/exploration/process',
  },
  {
    process_id: 'P-US-02',
    stream: 'upstream',
    department: 'Reservoir Engineering',
    process_name: 'Well Planning & Design',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: '3-6 months',
    ai_models: ['Casing Point Selector', 'Trajectory Optimizer', 'Cost Estimator ML'],
    detail_url: '/upstream/reservoir/process',
  },
  {
    process_id: 'P-US-03',
    stream: 'upstream',
    department: 'Drilling Engineering',
    process_name: 'Drilling Operations',
    step_count: 6,
    sub_process_count: 9,
    status: 'drilling',
    avg_cycle_time: '30-90 days/well',
    ai_models: ['ROP Optimizer', 'Stuck Pipe Predictor', 'Geosteering AI', 'Formation Eval AI', 'Vibration Detector'],
    detail_url: '/upstream/drilling/process',
  },
  {
    process_id: 'P-US-04',
    stream: 'upstream',
    department: 'Completions Engineering',
    process_name: 'Well Completion & Testing',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: '14-45 days/well',
    ai_models: ['Completion Optimizer', 'Frac Design AI', 'Well Test Analyzer'],
    detail_url: '/upstream/production/process',
  },
  {
    process_id: 'P-US-05',
    stream: 'upstream',
    department: 'Production Engineering',
    process_name: 'Production Operations',
    step_count: 8,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Continuous',
    ai_models: ['Virtual Flow Meter', 'Hydrate Predictor', 'ESP Monitor', 'Production Allocator'],
    detail_url: '/upstream/production/process',
  },
  {
    process_id: 'P-US-06',
    stream: 'upstream',
    department: 'Integrity & HSE',
    process_name: 'Well Integrity & HSE',
    step_count: 6,
    sub_process_count: 6,
    status: 'active',
    avg_cycle_time: 'Continuous',
    ai_models: ['Corrosion Rate Predictor', 'DHSV Test Optimizer', 'Cement Eval AI', 'PPE Compliance CV'],
    detail_url: '/upstream/well-integrity/process',
  },
];

export async function GET() {
  try {
    await ensureTables();

    // Upsert seed data
    for (const p of UPSTREAM_PROCESSES) {
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
      `SELECT * FROM ogo_process WHERE stream = 'upstream' ORDER BY process_id`
    );

    return NextResponse.json({
      processes: result.rows,
      enriched: UPSTREAM_PROCESSES,
      total: result.rows.length,
      _source: 'db',
    });
  } catch (err) {
    console.error('ogo_process GET error:', err);
    return NextResponse.json({
      processes: [],
      enriched: UPSTREAM_PROCESSES,
      total: UPSTREAM_PROCESSES.length,
      _source: 'fallback',
      _error: String(err),
    });
  }
}
