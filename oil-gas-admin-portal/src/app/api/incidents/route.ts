import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const res = await query(`SELECT * FROM oga_incident ORDER BY reported_at DESC`);
    const rows = res.rows;

    // Calculate TRIF
    const recordable = rows.filter(r => r.incident_type === 'recordable' || r.incident_type === 'lti' || r.incident_type === 'fatality');
    const totalHours = rows.reduce((sum: number, r) => sum + parseFloat(r.hours_worked || 0), 0);
    const trif = totalHours > 0 ? ((recordable.length * 200000) / totalHours).toFixed(2) : '0.00';

    return NextResponse.json({ incidents: rows, trif, total_hours: totalHours, recordable_count: recordable.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incident_type, stream, location, severity, hours_worked } = body;
    const res = await query(
      `INSERT INTO oga_incident (incident_type, stream, location, severity, status, hours_worked) VALUES ($1,$2,$3,$4,'open',$5) RETURNING *`,
      [incident_type, stream, location, severity, hours_worked ?? 0]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
