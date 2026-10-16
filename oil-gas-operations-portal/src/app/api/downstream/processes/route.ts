export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

const DOWNSTREAM_PROCESSES = [
  { process_id: 'P-DS-01', process_name: 'Crude Distillation Process (CDU/VDU)', stream: 'Downstream', department: 'Refinery Operations', step_count: 5, sub_process_count: 5, status: 'active', ai_models: ['Desalter Efficiency Optimizer', 'Corrosion Rate Predictor', 'Cut Point Optimizer', 'Column Stability Monitor', 'Fouling Rate Predictor', 'Vacuum Level Controller', 'Catalyst Deactivation Model', 'FCC Yield Predictor'], kpis: ['CDU Throughput bpd', 'Outlet Salt PTB', 'FCC Conversion %', 'Gasoline Yield %', 'Coke Yield %'] },
  { process_id: 'P-DS-02', process_name: 'Process Optimization & Crude Blending', stream: 'Downstream', department: 'Process Engineering', step_count: 4, sub_process_count: 4, status: 'active', ai_models: ['Property Blending Model', 'Crude Price Forecaster', 'Digital Twin MPC', 'Constraint Softening ML'], kpis: ['Refinery Margin $/bbl', 'LP Iterations/day', 'Blend Error %', 'APC Uptime %'] },
  { process_id: 'P-DS-03', process_name: 'Product Quality Control', stream: 'Downstream', department: 'Product Quality', step_count: 6, sub_process_count: 5, status: 'active', ai_models: ['NIR Prediction Model', 'Spec Violation Predictor', 'Out-of-Spec Root Cause Analyzer', 'Blend Optimizer'], kpis: ['Lab TAT hrs', 'Spec Compliance %', 'NIR Accuracy %'] },
  { process_id: 'P-DS-04', process_name: 'Product Distribution', stream: 'Downstream', department: 'Distribution', step_count: 6, sub_process_count: 5, status: 'active', ai_models: ['Loading Scheduler', 'Contamination Predictor', 'Additive Dosing Optimizer', 'Demand Forecaster'], kpis: ['Rack Utilization %', 'On-Time Delivery %', 'Truck Queue min'] },
  { process_id: 'P-DS-05', process_name: 'Commercial & Trading', stream: 'Downstream', department: 'Commercial Trading', step_count: 6, sub_process_count: 5, status: 'active', ai_models: ['Price Forecaster LSTM', 'Optimal Crude Selector', 'Contract Risk Analyzer', 'Margin Optimizer', 'Product Demand Forecaster'], kpis: ['Crude Procurement $/bbl', 'Crack Spread $/bbl', 'PnL $MM'] },
  { process_id: 'P-DS-06', process_name: 'Environmental Compliance', stream: 'Downstream', department: 'Environmental', step_count: 6, sub_process_count: 5, status: 'active', ai_models: ['Flare Analyzer CV', 'Emission Forecaster', 'NOx Optimizer', 'Biotreatment Optimizer', 'Spill Risk Predictor'], kpis: ['SO2 ppm', 'NOx ppm', 'GHG tCO2e/yr', 'Wastewater Oil ppm'] },
];

async function ensureTables() {
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
  } finally {
    client.release();
  }
}

async function seedIfEmpty() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT COUNT(*) FROM ogo_process');
    if (parseInt(rows[0].count) === 0) {
      for (const p of DOWNSTREAM_PROCESSES) {
        await client.query(
          `INSERT INTO ogo_process (process_id, stream, department, process_name, step_count, sub_process_count, status, ai_models, kpis)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (process_id) DO NOTHING`,
          [p.process_id, p.stream, p.department, p.process_name, p.step_count, p.sub_process_count, p.status, JSON.stringify(p.ai_models), JSON.stringify(p.kpis)]
        );
      }
    }
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    await ensureTables();
    await seedIfEmpty();
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM ogo_process WHERE stream = $1 ORDER BY process_id', ['Downstream']);
      return Response.json({
        processes: rows.length > 0 ? rows : DOWNSTREAM_PROCESSES,
        total: rows.length > 0 ? rows.length : DOWNSTREAM_PROCESSES.length,
        stream: 'Downstream',
        _source: rows.length > 0 ? 'db' : 'static',
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('ogo_process GET error:', err);
    return Response.json({
      processes: DOWNSTREAM_PROCESSES,
      total: DOWNSTREAM_PROCESSES.length,
      stream: 'Downstream',
      _source: 'static_fallback',
      _error: String(err),
    });
  }
}
