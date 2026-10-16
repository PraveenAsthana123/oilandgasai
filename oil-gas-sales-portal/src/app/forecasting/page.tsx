'use client';
import { useEffect, useState } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateForecast(opps: any[]) {
  const months = MONTHS.map((m, i) => {
    const monthOpps = opps.filter((o: any) => {
      if (!o.close_date) return false;
      const d = new Date(o.close_date);
      return d.getMonth() === i && d.getFullYear() === 2026;
    });
    const base = monthOpps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0) * (o.probability / 100), 0);
    return {
      month: m,
      base: Math.round(base),
      bull: Math.round(base * 1.3),
      bear: Math.round(base * 0.6),
      deals: monthOpps.length,
    };
  });
  return months;
}

export default function ForecastingPage() {
  const [opps, setOpps] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [scenario, setScenario] = useState<'base' | 'bull' | 'bear'>('base');

  useEffect(() => {
    fetch('/api/opportunities').then(r => r.json()).then(d => {
      const o = Array.isArray(d) ? d : [];
      setOpps(o);
      setForecast(generateForecast(o));
    });
  }, []);

  const totalForecast = forecast.reduce((s, m) => s + (m[scenario] || 0), 0);
  const maxVal = Math.max(...forecast.map(m => Math.max(m.bull, 1)));

  const scenarioColors = { base: 'bg-blue-500', bull: 'bg-emerald-500', bear: 'bg-orange-500' };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue Forecasting</h1>
        <p className="text-slate-400 text-sm mt-1">Pipeline-weighted forecast with scenario analysis</p>
      </div>

      {/* Scenario Toggle */}
      <div className="flex gap-2">
        {(['base', 'bull', 'bear'] as const).map(s => (
          <button key={s} onClick={() => setScenario(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${scenario === s ? 'bg-emerald-600 text-white' : 'bg-[#0f1629] border border-[#1e2a45] text-slate-300 hover:bg-[#1e2a45]'}`}>
            {s === 'bull' ? '📈 Bull' : s === 'bear' ? '📉 Bear' : '📊 Base'} Scenario
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Total Forecast ({scenario})</div>
          <div className="text-xl font-bold text-emerald-400">${(totalForecast / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Weighted Pipeline</div>
          <div className="text-xl font-bold text-white">${(opps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0) * (o.probability / 100), 0) / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Active Opportunities</div>
          <div className="text-xl font-bold text-white">{opps.filter((o: any) => !['won','lost'].includes(o.stage)).length}</div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
          <div className="text-xs text-slate-400">Avg Deal Size</div>
          <div className="text-xl font-bold text-white">
            ${opps.length > 0 ? (opps.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0) / opps.length / 1000000).toFixed(1) : '0'}M
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-4">Monthly Revenue Forecast — {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Case (CAD)</h2>
        <div className="flex items-end gap-2 h-40">
          {forecast.map((m: any) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-emerald-400">{m[scenario] > 0 ? `$${(m[scenario] / 1000).toFixed(0)}K` : ''}</div>
              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-t ${scenarioColors[scenario]}`}
                  style={{ height: `${maxVal > 0 ? (m[scenario] / maxVal * 90) : 0}px`, minHeight: m[scenario] > 0 ? '4px' : '0' }}
                />
              </div>
              <div className="text-xs text-slate-500">{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]">
          <h2 className="text-sm font-semibold text-white">Monthly Scenario Comparison (CAD)</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
              <th className="text-left px-4 py-3">Month</th>
              <th className="text-left px-4 py-3">🐻 Bear (-40%)</th>
              <th className="text-left px-4 py-3">📊 Base</th>
              <th className="text-left px-4 py-3">🐂 Bull (+30%)</th>
              <th className="text-left px-4 py-3">Deals</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((m: any) => (
              <tr key={m.month} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-2 text-white font-medium">{m.month} 2026</td>
                <td className="px-4 py-2 text-orange-400">{m.bear > 0 ? `$${m.bear.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-2 text-blue-400 font-semibold">{m.base > 0 ? `$${m.base.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-2 text-emerald-400 font-semibold">{m.bull > 0 ? `$${m.bull.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-2 text-slate-400">{m.deals}</td>
              </tr>
            ))}
            <tr className="bg-[#0a0e1a] font-semibold">
              <td className="px-4 py-3 text-white">TOTAL 2026</td>
              <td className="px-4 py-3 text-orange-400">${forecast.reduce((s, m) => s + m.bear, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-blue-400">${forecast.reduce((s, m) => s + m.base, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-emerald-400">${forecast.reduce((s, m) => s + m.bull, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-slate-400">{forecast.reduce((s, m) => s + m.deals, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
