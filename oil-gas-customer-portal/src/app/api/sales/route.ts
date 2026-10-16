export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const [leads, opps] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM ogcu_lead'),
      pool.query('SELECT COUNT(*), SUM(value) FROM ogcu_opportunity'),
    ]);
    return Response.json({
      leads: parseInt(leads.rows[0].count),
      opportunities: parseInt(opps.rows[0].count),
      pipeline: parseFloat(opps.rows[0].sum) || 0,
    });
  } catch (e: unknown) {
    return Response.json({ leads: 0, opportunities: 0, pipeline: 0 });
  }
}
