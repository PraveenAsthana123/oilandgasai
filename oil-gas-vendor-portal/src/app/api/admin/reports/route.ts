export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [vendors, rfqs, bids, pos, invoices, disputes] = await Promise.all([
      pool.query('SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE approval_status=\'approved\') as approved FROM ogv_vendor'),
      pool.query('SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE status=\'open\') as open FROM ogv_rfq'),
      pool.query('SELECT COUNT(*) as count, SUM(amount_cad) as total_value FROM ogv_bid'),
      pool.query('SELECT COUNT(*) as count, SUM(amount_cad) as total_value, COUNT(*) FILTER (WHERE status=\'complete\') as complete FROM ogv_purchase_order'),
      pool.query('SELECT COUNT(*) as count, SUM(total_cad) as total_value, COUNT(*) FILTER (WHERE status=\'paid\') as paid FROM ogv_invoice'),
      pool.query('SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE status=\'open\') as open FROM ogv_dispute'),
    ]);

    return NextResponse.json({
      summary: {
        vendors: vendors.rows[0],
        rfqs: rfqs.rows[0],
        bids: bids.rows[0],
        purchase_orders: pos.rows[0],
        invoices: invoices.rows[0],
        disputes: disputes.rows[0],
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
