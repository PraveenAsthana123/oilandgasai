export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT qc.*, d.product AS delivery_product, d.volume, d.unit, d.delivery_date,
             cu.company, cu.contact_name
      FROM ogcu_quality_cert qc
      JOIN ogcu_delivery d ON d.id = qc.delivery_id
      JOIN ogcu_customer cu ON cu.id = d.customer_id
      ORDER BY qc.created_at DESC
    `);
    return Response.json({ certs: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
