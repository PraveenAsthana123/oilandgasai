import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const [users, auditActions, incidents, compliance] = await Promise.all([
      query(`SELECT role, COUNT(*) as count FROM oga_user WHERE active=true GROUP BY role ORDER BY count DESC`),
      query(`SELECT action, COUNT(*) as count FROM oga_audit_log GROUP BY action ORDER BY count DESC LIMIT 10`),
      query(`SELECT incident_type, COUNT(*) as count FROM oga_incident GROUP BY incident_type`),
      query(`SELECT status, COUNT(*) as count FROM oga_compliance GROUP BY status`),
    ]);

    return NextResponse.json({
      users_by_role: users.rows,
      top_actions: auditActions.rows,
      incidents_by_type: incidents.rows,
      compliance_by_status: compliance.rows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
