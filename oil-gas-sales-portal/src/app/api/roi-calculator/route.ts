export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const downtime_hours = parseFloat(searchParams.get('downtime_hours') || '200');
  const production_boe_day = parseFloat(searchParams.get('production_boe_day') || '5000');
  const oil_price_cad = parseFloat(searchParams.get('oil_price_cad') || '110');
  const maintenance_cad = parseFloat(searchParams.get('maintenance_cad') || '2000000');
  const incidents_per_year = parseFloat(searchParams.get('incidents_per_year') || '3');

  // Avoided downtime value: hours/yr × BOE/day/24 × price × 0.30 reduction
  const avoided_downtime = downtime_hours * (production_boe_day / 24) * oil_price_cad * 0.30;
  // Maintenance savings: 25% reduction
  const maintenance_savings = maintenance_cad * 0.25;
  // Safety incident savings: incidents × $500K × 40% reduction
  const safety_savings = incidents_per_year * 500000 * 0.40;
  const total_annual_benefit = avoided_downtime + maintenance_savings + safety_savings;

  // Implementation costs
  const impl_cost_year1 = 2000000;
  const ongoing_cost = 800000;

  // 5-year NPV at 8% discount rate
  const discount_rate = 0.08;
  let npv = -impl_cost_year1;
  const yearly = [];
  for (let year = 1; year <= 5; year++) {
    const net = total_annual_benefit - (year === 1 ? impl_cost_year1 + ongoing_cost : ongoing_cost);
    const discounted = net / Math.pow(1 + discount_rate, year);
    npv += discounted;
    yearly.push({ year, benefit: Math.round(total_annual_benefit), cost: year === 1 ? impl_cost_year1 + ongoing_cost : ongoing_cost, net: Math.round(net), discounted: Math.round(discounted) });
  }

  // Payback period
  let cumulative = -impl_cost_year1;
  let payback_years = null;
  for (let y = 1; y <= 5; y++) {
    cumulative += total_annual_benefit - (y === 1 ? impl_cost_year1 + ongoing_cost : ongoing_cost);
    if (cumulative >= 0 && payback_years === null) payback_years = y;
  }

  return Response.json({
    inputs: { downtime_hours, production_boe_day, oil_price_cad, maintenance_cad, incidents_per_year },
    results: {
      avoided_downtime: Math.round(avoided_downtime),
      maintenance_savings: Math.round(maintenance_savings),
      safety_savings: Math.round(safety_savings),
      total_annual_benefit: Math.round(total_annual_benefit),
      impl_cost_year1,
      ongoing_cost,
      npv_5yr: Math.round(npv),
      payback_years: payback_years ?? '>5',
      yearly,
    }
  });
}
