export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const poRes = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'complete') as total_deliveries,
        COUNT(*) FILTER (WHERE status = 'complete' AND on_time = true) as on_time_deliveries,
        COUNT(*) FILTER (WHERE status = 'complete' AND quality_accepted = true) as accepted_deliveries
      FROM ogv_purchase_order
      WHERE vendor_id = 1
    `);

    const invRes = await pool.query(`
      SELECT
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE disputed = false AND status IN ('approved','paid')) as clean_invoices
      FROM ogv_invoice
      WHERE vendor_id = 1
    `);

    const safetyRes = await pool.query(`
      SELECT trif, lti_rate, last_audit_date, sms_status
      FROM ogv_safety_stat WHERE vendor_id = 1 ORDER BY year DESC LIMIT 1
    `);

    const po = poRes.rows[0];
    const inv = invRes.rows[0];
    const safety = safetyRes.rows[0] || { trif: 0, lti_rate: 0 };

    const totalDel = parseInt(po.total_deliveries) || 0;
    const onTimeDel = parseInt(po.on_time_deliveries) || 0;
    const acceptedDel = parseInt(po.accepted_deliveries) || 0;
    const totalInv = parseInt(inv.total_invoices) || 0;
    const cleanInv = parseInt(inv.clean_invoices) || 0;

    const onTimeRate = totalDel > 0 ? Math.round((onTimeDel / totalDel) * 100) : 0;
    const qualityRate = totalDel > 0 ? Math.round((acceptedDel / totalDel) * 100) : 0;
    const invoiceAccuracy = totalInv > 0 ? Math.round((cleanInv / totalInv) * 100) : 0;
    const trif = parseFloat(safety.trif) || 0;
    const overallScore = Math.round(((onTimeRate + qualityRate + invoiceAccuracy) / 3) * 5 / 100 * 10) / 10;

    // Trend data (12 months simulated from real aggregate)
    const trend = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2026, i, 1).toLocaleString('default', { month: 'short' });
      const base = overallScore * 20;
      const variance = Math.sin(i) * 5;
      return { month, score: Math.min(100, Math.max(60, Math.round(base + variance))) };
    });

    return NextResponse.json({
      on_time_rate: onTimeRate,
      quality_rate: qualityRate,
      invoice_accuracy: invoiceAccuracy,
      trif,
      lti_rate: parseFloat(safety.lti_rate) || 0,
      overall_score: overallScore,
      trend,
      benchmarks: {
        on_time_industry: 87,
        quality_industry: 91,
        invoice_industry: 88,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
