export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import pool from '@/lib/db';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_appointment (
      id SERIAL PRIMARY KEY,
      title TEXT,
      type TEXT,
      appt_date DATE,
      appt_time TIME,
      location TEXT,
      attendees TEXT,
      notes TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

const MOCK_APPOINTMENTS = [
  {
    id: 1, title: 'Well Site Inspection – Block 7A', type: 'Site Visit',
    appt_date: new Date().toISOString().split('T')[0],
    appt_time: '09:00', location: 'Block 7A, North Field',
    attendees: 'John Smith, Mary Lee', notes: 'Bring safety gear', status: 'confirmed',
    created_at: new Date().toISOString(),
  },
  {
    id: 2, title: 'HSE Regulatory Audit', type: 'Audit',
    appt_date: new Date().toISOString().split('T')[0],
    appt_time: '14:00', location: 'Refinery Control Room',
    attendees: 'HSE Team, Regulator Jones', notes: 'Annual audit Q4', status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    await ensureTable();
    const res = await pool.query('SELECT * FROM ogo_appointment ORDER BY appt_date, appt_time');
    return Response.json({ appointments: res.rows });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ appointments: MOCK_APPOINTMENTS, _mock: true, _reason: msg });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const body = await request.json();
    const { title, type, appt_date, appt_time, location, attendees, notes, status } = body;
    const res = await pool.query(
      `INSERT INTO ogo_appointment (title, type, appt_date, appt_time, location, attendees, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, type, appt_date, appt_time, location, attendees, notes, status || 'confirmed']
    );
    return Response.json({ appointment: res.rows[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg, _mock: true }, { status: 500 });
  }
}
