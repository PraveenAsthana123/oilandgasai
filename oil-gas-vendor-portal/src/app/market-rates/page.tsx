'use client';
import { useState } from 'react';

const BENCHMARKS = [
  { category: 'Drilling Services', metric: 'Day Rate (Top Drive Rig)', low: 18000, avg: 24000, high: 32000, unit: '$/day', trend: '+3.2%' },
  { category: 'Pipeline Services', metric: 'Pipeline Construction', low: 850, avg: 1200, high: 1600, unit: '$/m', trend: '+1.8%' },
  { category: 'Inspection & NDT', metric: 'ILI Inspection Run', low: 45000, avg: 72000, high: 110000, unit: '$ fixed', trend: '-0.5%' },
  { category: 'Inspection & NDT', metric: 'Manual UT (Fabrication)', low: 75, avg: 110, high: 145, unit: '$/hr', trend: '+2.1%' },
  { category: 'Maintenance & Repair', metric: 'Maintenance Contract (Facility)', low: 180000, avg: 240000, high: 320000, unit: '$/yr', trend: '+4.0%' },
  { category: 'Environmental Services', metric: 'Phase II ESA', low: 18000, avg: 32000, high: 55000, unit: '$ fixed', trend: '+1.5%' },
  { category: 'Safety Services', metric: 'H2S Alive Training (per person)', low: 175, avg: 225, high: 300, unit: '$/person', trend: '+0.8%' },
  { category: 'Engineering Services', metric: 'P.Eng. Rate', low: 140, avg: 185, high: 240, unit: '$/hr', trend: '+5.2%' },
];

export default function MarketRatesPage() {
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const getInsight = async () => {
    setLoading(true);
    const res = await fetch('/api/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query || 'What are current market rate trends for Oil & Gas vendors in Alberta, Canada? What should vendors consider when pricing bids?', context: 'Market rate benchmarking' }),
    });
    const data = await res.json();
    setAiInsight(data.response || '');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Rate Benchmarking</h1>
        <p className="text-gray-400 text-sm mt-1">Industry pricing benchmarks for O&G services in Western Canada — updated Q4 2026</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]">
            <tr>
              {['Service Category', 'Metric', 'Low', 'Market Avg', 'High', 'Unit', 'YoY Trend'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENCHMARKS.map((b) => (
              <tr key={b.metric} className="border-t border-[#1e2a45] hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3 text-purple-400">{b.category}</td>
                <td className="px-4 py-3 text-gray-300">{b.metric}</td>
                <td className="px-4 py-3 text-gray-400">${b.low.toLocaleString()}</td>
                <td className="px-4 py-3 text-white font-medium">${b.avg.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">${b.high.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{b.unit}</td>
                <td className={`px-4 py-3 font-medium ${b.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{b.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#0f1629] border border-purple-500/50 rounded-lg p-5 space-y-3">
        <h2 className="text-white font-semibold">🤖 AI Pricing Insights (Ollama)</h2>
        <div className="flex gap-2">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. How should I price pipeline inspection services? What market factors affect drilling rates?"
            className="flex-1 bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
          <button onClick={getInsight} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
            {loading ? '...' : 'Get Insights'}
          </button>
        </div>
        {aiInsight && (
          <div className="bg-purple-900/10 border border-purple-800 rounded p-3 text-gray-300 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">{aiInsight}</div>
        )}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 text-xs text-gray-500">
        ⚠️ Market rates are indicative benchmarks compiled from public industry data (CAOEC Day Rate Survey, PSAC Well Cost Study, CAPP data). Actual rates vary by geography, scope, contractor size, and market conditions. This data should be used as a reference only — not for contract negotiations without verification.
      </div>
    </div>
  );
}
