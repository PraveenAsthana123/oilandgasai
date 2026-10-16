export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT i.*, cu.company, cu.contact_name, d.product, d.volume, d.unit,
        CASE WHEN i.status = 'outstanding' AND i.due_date < CURRENT_DATE THEN 'overdue'
             ELSE i.status END AS computed_status,
        (CURRENT_DATE - i.due_date) AS days_overdue
      FROM ogcu_invoice i
      JOIN ogcu_customer cu ON cu.id = i.customer_id
      LEFT JOIN ogcu_delivery d ON d.id = i.delivery_id
      ORDER BY i.created_at DESC
    `);
    return Response.json({ invoices: rows });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
