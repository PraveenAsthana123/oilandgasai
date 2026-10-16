export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, cu.company, cu.contact_name,
        CASE WHEN c.end_date - CURRENT_DATE <= 90 THEN true ELSE false END AS renewal_alert,
        (c.end_date - CURRENT_DATE) AS days_to_expiry
      FROM ogcu_contract c
      JOIN ogcu_customer cu ON cu.id = c.customer_id
      ORDER BY c.created_at DESC
    `);
    return Response.json({ contracts: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
