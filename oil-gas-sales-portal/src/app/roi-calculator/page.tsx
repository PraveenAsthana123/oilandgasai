'use client';
import { useState } from 'react';

export default function ROICalculatorPage() {
  const [inputs, setInputs] = useState({
    downtime_hours: 200,
    production_boe_day: 5000,
    oil_price_cad: 110,
    maintenance_cad: 2000000,
    incidents_per_year: 3,
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    const params = new URLSearchParams(Object.entries(inputs).map(([k, v]) => [k, String(v)]));
    const data = await fetch(`/api/roi-calculator?${params}`).then(r => r.json());
    setResults(data.results);
    setLoading(false);
  };

  const maxBar = results ? Math.max(results.total_annual_benefit, results.impl_cost_year1) : 1;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">ROI Calculator</h1>
        <p className="text-slate-400 text-sm mt-1">Calculate projected savings from AI monitoring deployment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold text-white">Client Current State Inputs</h2>

          {[
            { key: 'downtime_hours', label: 'Unplanned Downtime (hours/year)', min: 0, max: 2000, step: 10 },
            { key: 'production_boe_day', label: 'Production Rate (BOE/day)', min: 100, max: 500000, step: 100 },
            { key: 'oil_price_cad', label: 'Oil Price (CAD/bbl)', min: 40, max: 200, step: 1 },
            { key: 'maintenance_cad', label: 'Annual Maintenance Cost (CAD)', min: 100000, max: 50000000, step: 100000 },
            { key: 'incidents_per_year', label: 'Safety Incidents per Year', min: 0, max: 20, step: 1 },
          ].map(f => (
            <div key={f.key}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">{f.label}</label>
                <span className="text-emerald-400 text-xs font-bold">{(inputs as any)[f.key].toLocaleString()}</span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step} value={(inputs as any)[f.key]}
                onChange={e => setInputs(i => ({ ...i, [f.key]: parseFloat(e.target.value) }))}
                className="w-full accent-emerald-500" />
              <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                <span>{f.min.toLocaleString()}</span>
                <span>{f.max.toLocaleString()}</span>
              </div>
            </div>
          ))}

          <button onClick={calculate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium">
            {loading ? 'Calculating...' : 'Calculate ROI'}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!results && (
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-6 flex flex-col items-center justify-center h-64 text-slate-500">
              <span className="text-3xl mb-2">🧮</span>
              <span>Configure inputs and click Calculate</span>
            </div>
          )}

          {results && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f1629] border border-emerald-500/30 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Annual Benefits (CAD)</div>
                  <div className="text-xl font-bold text-emerald-400">${results.total_annual_benefit.toLocaleString()}</div>
                </div>
                <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
                  <div className="text-xs text-slate-400">5-Year NPV (CAD)</div>
                  <div className={`text-xl font-bold ${results.npv_5yr > 0 ? 'text-emerald-400' : 'text-red-400'}`}>${results.npv_5yr.toLocaleString()}</div>
                </div>
                <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
                  <div className="text-xs text-slate-400">Payback Period</div>
                  <div className="text-xl font-bold text-white">{results.payback_years} years</div>
                </div>
                <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
                  <div className="text-xs text-slate-400">Yr 1 Net Cost (CAD)</div>
                  <div className="text-xl font-bold text-slate-300">${(results.impl_cost_year1 + results.ongoing_cost).toLocaleString()}</div>
                </div>
              </div>

              {/* Benefits Breakdown */}
              <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Annual Benefits Breakdown</h3>
                {[
                  { label: 'Avoided Downtime (30%)', value: results.avoided_downtime, color: 'bg-blue-500' },
                  { label: 'Maintenance Savings (25%)', value: results.maintenance_savings, color: 'bg-purple-500' },
                  { label: 'Safety Incident Prevention (40%)', value: results.safety_savings, color: 'bg-emerald-500' },
                ].map(b => (
                  <div key={b.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{b.label}</span>
                      <span className="text-white font-semibold">${b.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-[#1e2a45] rounded-full h-2">
                      <div className={`${b.color} h-2 rounded-full`} style={{ width: `${results.total_annual_benefit > 0 ? (b.value / results.total_annual_benefit * 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 5-Year Timeline */}
              <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">5-Year ROI Timeline</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-[#1e2a45]">
                        <th className="text-left pb-2">Year</th>
                        <th className="text-right pb-2">Benefit</th>
                        <th className="text-right pb-2">Cost</th>
                        <th className="text-right pb-2">Net (CAD)</th>
                        <th className="text-right pb-2">Discounted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(results.yearly || []).map((y: any) => (
                        <tr key={y.year} className="border-b border-[#1e2a45]/40">
                          <td className="py-1.5 text-white">Year {y.year}</td>
                          <td className="py-1.5 text-right text-emerald-400">${y.benefit.toLocaleString()}</td>
                          <td className="py-1.5 text-right text-red-400">${y.cost.toLocaleString()}</td>
                          <td className={`py-1.5 text-right font-semibold ${y.net > 0 ? 'text-emerald-400' : 'text-red-400'}`}>${y.net.toLocaleString()}</td>
                          <td className="py-1.5 text-right text-slate-400">${y.discounted.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
