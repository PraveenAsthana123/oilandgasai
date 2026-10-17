export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM
  const [year, mon] = month.split('-').map(Number);

  try {
    // Ensure tables exist (no-op if already created by other routes)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ogo_job_run (
        id SERIAL PRIMARY KEY, job_name TEXT, dataset TEXT, status TEXT DEFAULT 'pending',
        started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, result JSONB, error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogo_appointment (
        id SERIAL PRIMARY KEY, title TEXT, type TEXT, appt_date DATE, appt_time TIME,
        location TEXT, attendees TEXT, notes TEXT, status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ogo_milestone (
        id SERIAL PRIMARY KEY, title TEXT, description TEXT, dept TEXT, due_date DATE,
        status TEXT DEFAULT 'pending', priority TEXT DEFAULT 'medium',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(mon).padStart(2, '0')}-${new Date(year, mon, 0).getDate()}`;

    const events: { date: string; type: string; title: string; color: string }[] = [];

    // Job runs
    const jobs = await pool.query(
      `SELECT DATE(created_at) as date, job_name FROM ogo_job_run
       WHERE DATE(created_at) >= $1 AND DATE(created_at) <= $2`,
      [startDate, endDate]
    );
    for (const row of jobs.rows) {
      events.push({ date: row.date.toISOString().split('T')[0], type: 'job', title: row.job_name || 'Job Run', color: 'green' });
    }

    // Appointments
    const appts = await pool.query(
      `SELECT appt_date::text as date, title FROM ogo_appointment
       WHERE appt_date >= $1::date AND appt_date <= $2::date`,
      [startDate, endDate]
    );
    for (const row of appts.rows) {
      events.push({ date: row.date, type: 'appointment', title: row.title, color: 'blue' });
    }

    // Milestones
    const milestones = await pool.query(
      `SELECT due_date::text as date, title FROM ogo_milestone
       WHERE due_date >= $1::date AND due_date <= $2::date`,
      [startDate, endDate]
    );
    for (const row of milestones.rows) {
      events.push({ date: row.date, type: 'milestone', title: row.title, color: 'amber' });
    }

    return Response.json({ events, month });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ events: [], month, _mock: true, _reason: msg });
  }
}
