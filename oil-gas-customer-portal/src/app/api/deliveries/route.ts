export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT d.*, cu.company, cu.contact_name,
        qc.spec_status, qc.api_gravity, qc.sulphur_pct
      FROM ogcu_delivery d
      JOIN ogcu_customer cu ON cu.id = d.customer_id
      LEFT JOIN ogcu_quality_cert qc ON qc.delivery_id = d.id
      ORDER BY d.delivery_date DESC
    `);
    return Response.json({ deliveries: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
