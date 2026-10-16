export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

export async function GET() {
  try {
    const [leads, opps, accounts, contracts] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, status, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL \'30 days\') as mtd FROM ogs_lead GROUP BY status'),
      pool.query('SELECT stage, COUNT(*) as count, SUM(value_cad) as value FROM ogs_opportunity GROUP BY stage'),
      pool.query('SELECT stream, COUNT(*) as count, SUM(revenue_cad) as revenue FROM ogs_account GROUP BY stream'),
      pool.query('SELECT status, COUNT(*) as count, SUM(value_cad) as value FROM ogs_contract GROUP BY status'),
    ]);

    const totalLeads = leads.rows.reduce((s: number, r: any) => s + parseInt(r.total), 0);
    const qualifiedLeads = leads.rows.find((r: any) => r.status === 'qualified');
    const conversionRate = totalLeads > 0 ? ((parseInt(qualifiedLeads?.total || '0') / totalLeads) * 100).toFixed(1) : '0';

    const totalPipelineValue = opps.rows.reduce((s: number, r: any) => s + parseFloat(r.value || 0), 0);
    const wonDeals = opps.rows.find((r: any) => r.stage === 'won');
    const lostDeals = opps.rows.find((r: any) => r.stage === 'lost');

    return Response.json({
      leads: leads.rows,
      opportunities: opps.rows,
      accounts: accounts.rows,
      contracts: contracts.rows,
      summary: {
        total_leads: totalLeads,
        conversion_rate: conversionRate,
        total_pipeline_value_cad: Math.round(totalPipelineValue),
        won_deals: wonDeals?.count || 0,
        lost_deals: lostDeals?.count || 0,
      }
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
