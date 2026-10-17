export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `CREATE TABLE IF NOT EXISTS ogo_contact (
  id SERIAL PRIMARY KEY,
  name TEXT,
  role TEXT,
  company TEXT,
  phone TEXT,
  email TEXT,
  type TEXT DEFAULT 'internal',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`;

const SEEDS = [
  { name: 'Sarah Okafor', role: 'Regulatory Affairs Advisor', company: 'Alberta Energy Regulator', phone: '403-297-8311', email: 's.okafor@aer.ca', type: 'Regulator', notes: 'Primary AER contact for Directive 056 and well licensing queries' },
  { name: 'James Mackenzie', role: 'Drilling Superintendent', company: 'Internal — Upstream Ops', phone: '403-555-0142', email: 'j.mackenzie@company.com', type: 'Internal', notes: 'Responsible for all horizontal well programs in the Pembina and Duvernay areas' },
  { name: 'Lisa Gagnon', role: 'HSE Manager', company: 'Internal — HSE', phone: '403-555-0198', email: 'l.gagnon@company.com', type: 'Internal', notes: 'Emergency contact for all HSE incidents; holds CSTS-09 and WHMIS instructor credentials' },
  { name: 'Robert Tanner', role: 'Pipeline Integrity Engineer', company: 'Internal — Midstream', phone: '403-555-0227', email: 'r.tanner@company.com', type: 'Internal', notes: 'ILI program lead; certified per NACE SP0502 and CSA Z662 standards' },
  { name: 'Precision Drilling Corp.', role: 'Account Manager', company: 'Precision Drilling Corp.', phone: '403-716-4500', email: 'operations@precisiondrilling.com', type: 'Contractor', notes: 'Primary drilling contractor; 3 rigs contracted for Q3-Q4 2026 program' },
  { name: 'Michael Patel', role: 'Commercial Analyst', company: 'Internal — Commercial', phone: '403-555-0304', email: 'm.patel@company.com', type: 'Internal', notes: 'Gas marketing and hedging; manages Plains Midstream and TC Energy contracts' },
  { name: 'Enbridge Pipelines Inc.', role: 'Operations Contact', company: 'Enbridge Pipelines Inc.', phone: '780-420-6384', email: 'ops.contact@enbridge.com', type: 'Vendor', notes: 'Mainline crude nominations and nominations scheduling hotline' },
  { name: 'Dr. Keiko Zhang', role: 'Data Science Lead', company: 'Internal — Data Science & AI', phone: '403-555-0365', email: 'k.zhang@company.com', type: 'Internal', notes: 'Leads AI/ML model development; PhD in Reservoir Engineering from University of Calgary' },
  { name: 'ECCC Reporting Desk', role: 'GHG Reporting Officer', company: 'Environment and Climate Change Canada', phone: '819-938-3860', email: 'ghgreporting@ec.gc.ca', type: 'Regulator', notes: 'GHGRP and methane reporting; submissions portal: https://ghgreporting.canada.ca' },
  { name: 'Halliburton Canada', role: 'Completions Account Manager', company: 'Halliburton Canada', phone: '403-231-7700', email: 'completions.canada@halliburton.com', type: 'Vendor', notes: 'Fracturing and completions services; active QHSE agreements in place' },
];

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const countRes = await client.query('SELECT COUNT(*) FROM ogo_contact');
      if (parseInt(countRes.rows[0].count) === 0) {
        for (const s of SEEDS) {
          await client.query(
            `INSERT INTO ogo_contact (name, role, company, phone, email, type, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [s.name, s.role, s.company, s.phone, s.email, s.type, s.notes]
          );
        }
      }
      const { rows } = await client.query('SELECT * FROM ogo_contact ORDER BY type, name');
      const kpiRes = await client.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE type = 'Vendor') AS vendors,
          COUNT(*) FILTER (WHERE type = 'Contractor') AS contractors,
          COUNT(*) FILTER (WHERE type = 'Regulator') AS regulators,
          COUNT(*) FILTER (WHERE type = 'Internal') AS internal
        FROM ogo_contact
      `);
      return NextResponse.json({ data: rows, kpis: kpiRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json({ data: [], kpis: { total: 0, vendors: 0, contractors: 0, regulators: 0, internal: 0 }, _mock: true, _reason: 'DB unavailable' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, company, phone, email, type, notes } = body;
    const client = await pool.connect();
    try {
      await client.query(DDL);
      const { rows } = await client.query(
        `INSERT INTO ogo_contact (name, role, company, phone, email, type, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [name, role || '', company || '', phone || '', email || '', type || 'Internal', notes || '']
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
