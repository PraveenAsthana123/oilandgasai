export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { method = 'bank_transfer' } = await req.json().catch(() => ({}));
    const { rows } = await pool.query(
      'SELECT * FROM ogcu_invoice WHERE id = $1',
      [params.id]
    );
    if (!rows.length) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    const inv = rows[0];

    // Record payment intent
    await pool.query(
      `INSERT INTO ogcu_payment_intent (invoice_id, customer_id, amount_cad, method, status) VALUES ($1, $2, $3, $4, 'pending')`,
      [inv.id, inv.customer_id, inv.total_cad, method]
    );

    // Update invoice status (mock payment)
    await pool.query(
      `UPDATE ogcu_invoice SET status = 'paid', paid_at = NOW() WHERE id = $1`,
      [params.id]
    );

    await pool.query(
      `INSERT INTO ogcu_audit_log (user_id, action, record_type, record_id, details) VALUES ('customer', 'pay_invoice', 'ogcu_invoice', $1, $2)`,
      [params.id, JSON.stringify({ method, amount: inv.total_cad })]
    );

    return Response.json({ status: 'ok', message: 'Payment intent recorded. Processing via ' + method, invoice_id: params.id });
  } catch (e: unknown) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
