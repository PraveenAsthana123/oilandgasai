export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_payment (
  id SERIAL PRIMARY KEY,
  payment_num TEXT,
  payee TEXT,
  type TEXT,
  amount_k NUMERIC,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  dept TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

const SEEDS = [
  { payment_num: 'PAY-2026-0841', payee: 'Precision Drilling Corp.', type: 'Invoice', amount_k: 1240, due_date: '2026-10-30', status: 'pending', dept: 'Upstream', reference: 'INV-PD-44821' },
  { payment_num: 'PAY-2026-0839', payee: 'Alberta Energy Regulator', type: 'Fee', amount_k: 85, due_date: '2026-10-15', status: 'overdue', dept: 'Regulatory Affairs', reference: 'AER-FEE-2026-Q3' },
  { payment_num: 'PAY-2026-0830', payee: 'Halliburton Canada Ltd.', type: 'Invoice', amount_k: 3620, due_date: '2026-10-01', status: 'paid', dept: 'Upstream', reference: 'INV-HAL-99341' },
  { payment_num: 'PAY-2026-0827', payee: 'Alberta Crown — Royalties', type: 'Royalty', amount_k: 8750, due_date: '2026-10-25', status: 'pending', dept: 'Commercial', reference: 'ROYALTY-Q3-2026' },
  { payment_num: 'PAY-2026-0815', payee: 'Plains Midstream Canada', type: 'Fee', amount_k: 2180, due_date: '2026-09-30', status: 'paid', dept: 'Midstream', reference: 'GPA-PMC-2026-09' },
  { payment_num: 'PAY-2026-0812', payee: 'Schlumberger Canada', type: 'Invoice', amount_k: 1895, due_date: '2026-09-15', status: 'paid', dept: 'Upstream', reference: 'INV-SLB-77209' },
  { payment_num: 'PAY-2026-0856', payee: 'Enbridge Pipelines Inc.', type: 'Fee', amount_k: 4300, due_date: '2026-11-15', status: 'pending', dept: 'Midstream', reference: 'ENB-TOLL-NOV2026' },
  { payment_num: 'PAY-2026-0822', payee: 'Municipal District of Opportunity', type: 'Lease', amount_k: 215, due_date: '2026-09-01', status: 'overdue', dept: 'Land', reference: 'LEASE-MDO-2026' },
];

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const countRes = await client.query('SELECT COUNT(*) FROM ogo_payment');
      if (parseInt(countRes.rows[0].count) === 0) {
        for (const s of SEEDS) {
          await client.query(
            `INSERT INTO ogo_payment (payment_num, payee, type, amount_k, due_date, status, dept, reference)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [s.payment_num, s.payee, s.type, s.amount_k, s.due_date, s.status, s.dept, s.reference]
          );
        }
      }
      const { rows } = await client.query('SELECT * FROM ogo_payment ORDER BY due_date ASC');
      const kpiRes = await client.query(`
        SELECT
          COALESCE(SUM(amount_k) FILTER (WHERE status = 'paid' AND created_at >= date_trunc('month', NOW())), 0) AS paid_this_month_k,
          COALESCE(SUM(amount_k) FILTER (WHERE status = 'pending'), 0) AS pending_k,
          COUNT(*) FILTER (WHERE status = 'overdue') AS overdue_count,
          COALESCE(SUM(amount_k) FILTER (WHERE status = 'pending' AND due_date <= NOW() + INTERVAL '30 days'), 0) AS upcoming_30d_k
        FROM ogo_payment
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { paid_this_month_k: 0, pending_k: 0, overdue_count: 0, upcoming_30d_k: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_num, payee, type, amount_k, due_date, status, dept, reference } = body;

    const auto_num = payment_num || `PAY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_payment (payment_num, payee, type, amount_k, due_date, status, dept, reference)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [auto_num, payee, type || 'Invoice', amount_k || 0, due_date || null, status || 'pending', dept || 'Operations', reference || '']
      );
      return NextResponse.json({ data: rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: null, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
