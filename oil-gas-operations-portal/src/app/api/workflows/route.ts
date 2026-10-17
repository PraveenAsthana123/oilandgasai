export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import pool from '@/lib/db';

const SEED_TEMPLATES = [
  {
    name: 'Well Approval Workflow',
    dept: 'Upstream',
    steps: [
      { step: 1, name: 'Initiate Request', description: 'Well engineer submits approval request' },
      { step: 2, name: 'Technical Review', description: 'Drilling team reviews technical feasibility' },
      { step: 3, name: 'HSE Assessment', description: 'HSE team reviews safety requirements' },
      { step: 4, name: 'Management Approval', description: 'Operations manager approves' },
      { step: 5, name: 'Execute & Close', description: 'Execute and close request' },
    ],
  },
  {
    name: 'Permit to Work',
    dept: 'HSE',
    steps: [
      { step: 1, name: 'Permit Request', description: 'Worker submits permit to work request' },
      { step: 2, name: 'Risk Assessment', description: 'HSE conducts job safety analysis' },
      { step: 3, name: 'Supervisor Sign-off', description: 'Area supervisor authorizes' },
      { step: 4, name: 'Execute Work', description: 'Work is carried out safely' },
    ],
  },
  {
    name: 'Management of Change',
    dept: 'Engineering',
    steps: [
      { step: 1, name: 'Change Request', description: 'Initiator documents proposed change' },
      { step: 2, name: 'Impact Analysis', description: 'Team assesses safety and operational impact' },
      { step: 3, name: 'Technical Review', description: 'Engineering reviews technical implications' },
      { step: 4, name: 'Risk Assessment', description: 'HSE evaluates risk profile' },
      { step: 5, name: 'Approval', description: 'Senior management approves change' },
      { step: 6, name: 'Implement & Verify', description: 'Change implemented and verified' },
    ],
  },
  {
    name: 'Incident Report',
    dept: 'HSE',
    steps: [
      { step: 1, name: 'Report Incident', description: 'Affected party reports incident' },
      { step: 2, name: 'Immediate Response', description: 'Emergency response team activated' },
      { step: 3, name: 'Investigation', description: 'Root cause analysis performed' },
      { step: 4, name: 'Corrective Actions', description: 'Corrective actions assigned and tracked' },
      { step: 5, name: 'Close & Learn', description: 'Incident closed, learnings shared' },
    ],
  },
];

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_workflow_template (
      id SERIAL PRIMARY KEY,
      name TEXT,
      steps JSONB,
      dept TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS ogo_workflow_instance (
      id SERIAL PRIMARY KEY,
      template_id INT,
      title TEXT,
      current_step INT DEFAULT 0,
      status TEXT DEFAULT 'active',
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  // Seed templates if empty
  const count = await pool.query('SELECT COUNT(*) FROM ogo_workflow_template');
  if (parseInt(count.rows[0].count) === 0) {
    for (const t of SEED_TEMPLATES) {
      await pool.query(
        'INSERT INTO ogo_workflow_template (name, steps, dept) VALUES ($1, $2::jsonb, $3)',
        [t.name, JSON.stringify(t.steps), t.dept]
      );
    }
  }
}

export async function GET() {
  try {
    await ensureTables();

    const templates = await pool.query('SELECT * FROM ogo_workflow_template ORDER BY id');
    const instances = await pool.query(
      `SELECT wi.*, wt.name as template_name, wt.steps as template_steps
       FROM ogo_workflow_instance wi
       JOIN ogo_workflow_template wt ON wt.id = wi.template_id
       ORDER BY wi.created_at DESC LIMIT 50`
    );

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const completed = await pool.query(
      `SELECT COUNT(*) FROM ogo_workflow_instance WHERE status = 'completed' AND created_at >= $1`,
      [monthStart]
    );
    const overdue = await pool.query(
      `SELECT COUNT(*) FROM ogo_workflow_instance WHERE status = 'active' AND created_at < NOW() - INTERVAL '7 days'`
    );

    return Response.json({
      templates: templates.rows,
      instances: instances.rows,
      stats: {
        active: instances.rows.filter((r: { status: string }) => r.status === 'active').length,
        completed_month: parseInt(completed.rows[0].count),
        overdue: parseInt(overdue.rows[0].count),
        templates_count: templates.rows.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({
      templates: SEED_TEMPLATES.map((t, i) => ({ id: i + 1, ...t })),
      instances: [],
      stats: { active: 0, completed_month: 0, overdue: 0, templates_count: SEED_TEMPLATES.length },
      _mock: true,
      _reason: msg,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables();
    const body = await request.json();
    const { template_id, title, data } = body;
    const res = await pool.query(
      `INSERT INTO ogo_workflow_instance (template_id, title, current_step, status, data)
       VALUES ($1, $2, 0, 'active', $3::jsonb) RETURNING *`,
      [template_id, title, JSON.stringify(data || {})]
    );
    return Response.json({ instance: res.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, _mock: true }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureTables();
    const body = await request.json();
    const { id, current_step, status } = body;
    await pool.query(
      `UPDATE ogo_workflow_instance SET current_step = $2, status = $3, updated_at = NOW() WHERE id = $1`,
      [id, current_step, status]
    );
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, _mock: true }, { status: 500 });
  }
}
