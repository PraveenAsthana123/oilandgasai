'use client';

const COMPETITORS = [
  { name: 'Suncor Energy', type: 'Integrated Major', strength: 'Brand recognition, scale', weakness: 'Slow innovation cycle', winRate: 35, avgDealSize: '$3.2M', focus: 'Upstream' },
  { name: 'CNRL', type: 'E&P Operator', strength: 'Deep Athabasca expertise', weakness: 'Limited AI investment', winRate: 42, avgDealSize: '$2.8M', focus: 'Upstream' },
  { name: 'Cenovus Energy', type: 'Integrated', strength: 'Oil sands experience', weakness: 'High cost structure', winRate: 38, avgDealSize: '$2.5M', focus: 'Upstream' },
  { name: 'TC Energy', type: 'Pipeline Operator', strength: 'Pipeline network, safety record', weakness: 'Legacy tech stack', winRate: 45, avgDealSize: '$4.1M', focus: 'Midstream' },
  { name: 'Enbridge', type: 'Pipeline Operator', strength: 'North American network', weakness: 'Regulatory complexity', winRate: 40, avgDealSize: '$3.8M', focus: 'Midstream' },
];

const DIFFERENTIATORS = [
  { category: 'AI Capabilities', us: 'Real-time ML inference, edge AI', competitors: 'Rule-based alerts, batch analytics', advantage: 'high' },
  { category: 'Deployment Speed', us: '30-day pilot to production', competitors: '6-12 month enterprise cycle', advantage: 'high' },
  { category: 'Integration', us: 'Agnostic API, OPC-UA, SCADA native', competitors: 'Proprietary connectors', advantage: 'medium' },
  { category: 'Pricing', us: 'Per-asset SaaS model', competitors: 'Per-seat licensing', advantage: 'medium' },
  { category: 'Industry Expertise', us: 'Growing O&G team', competitors: 'Decades of sector experience', advantage: 'low' },
  { category: 'Brand Trust', us: 'Building reputation', competitors: 'Established relationships', advantage: 'low' },
];

const WIN_LOSS = [
  { quarter: 'Q1 2026', won: 3, lost: 2, lostTo: 'Suncor internal team' },
  { quarter: 'Q2 2026', won: 4, lost: 1, lostTo: 'CNRL incumbent vendor' },
  { quarter: 'Q3 2026', won: 5, lost: 2, lostTo: 'TC Energy budget freeze' },
  { quarter: 'Q4 2026', won: 2, lost: 1, lostTo: 'Cenovus deferred' },
];

export default function CompetitorsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Competitive Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">Competitor tracking, win/loss analysis, differentiator matrix</p>
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPETITORS.map(c => (
          <div key={c.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-white">{c.name}</div>
                <div className="text-xs text-blue-400">{c.type}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Win Rate vs</div>
                <div className={`font-bold ${c.winRate >= 40 ? 'text-emerald-400' : c.winRate >= 35 ? 'text-yellow-400' : 'text-red-400'}`}>{c.winRate}%</div>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-400">Focus: </span><span className="text-slate-300 capitalize">{c.focus}</span></div>
              <div><span className="text-slate-400">Avg Deal: </span><span className="text-emerald-400">{c.avgDealSize}</span></div>
              <div className="mt-2">
                <div className="text-emerald-400 mb-0.5">✓ {c.strength}</div>
                <div className="text-red-400">✗ {c.weakness}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Differentiator Matrix */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]">
          <h2 className="text-sm font-semibold text-white">Differentiator Matrix</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Our Position</th>
              <th className="text-left px-4 py-3">Competitors</th>
              <th className="text-left px-4 py-3">Advantage</th>
            </tr>
          </thead>
          <tbody>
            {DIFFERENTIATORS.map(d => (
              <tr key={d.category} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-3 font-medium text-white">{d.category}</td>
                <td className="px-4 py-3 text-emerald-400 text-xs">{d.us}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{d.competitors}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${d.advantage === 'high' ? 'bg-emerald-800 text-emerald-300' : d.advantage === 'medium' ? 'bg-yellow-800 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                    {d.advantage === 'high' ? '↑ Strong' : d.advantage === 'medium' ? '→ Neutral' : '↓ Weak'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Win/Loss Analysis */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Win/Loss Analysis by Quarter</h2>
        <div className="grid grid-cols-4 gap-3">
          {WIN_LOSS.map(q => {
            const total = q.won + q.lost;
            const winRate = total > 0 ? ((q.won / total) * 100).toFixed(0) : 0;
            return (
              <div key={q.quarter} className="bg-[#0a0e1a] rounded p-3">
                <div className="text-xs text-slate-400">{q.quarter}</div>
                <div className="flex gap-4 mt-2">
                  <div><div className="text-lg font-bold text-emerald-400">{q.won}</div><div className="text-xs text-slate-500">Won</div></div>
                  <div><div className="text-lg font-bold text-red-400">{q.lost}</div><div className="text-xs text-slate-500">Lost</div></div>
                  <div><div className="text-lg font-bold text-white">{winRate}%</div><div className="text-xs text-slate-500">Win Rate</div></div>
                </div>
                <div className="text-xs text-slate-500 mt-2">Lost to: {q.lostTo}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
