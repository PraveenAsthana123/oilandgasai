'use client';
import { useEffect, useState } from 'react';

const STAGES = ['prospect', 'qualified', 'technical_eval', 'commercial_proposal', 'negotiation', 'won', 'lost'];
const STAGE_COLORS: Record<string, string> = {
  prospect: 'border-slate-600',
  qualified: 'border-blue-600',
  technical_eval: 'border-purple-600',
  commercial_proposal: 'border-yellow-600',
  negotiation: 'border-orange-600',
  won: 'border-emerald-600',
  lost: 'border-red-700',
};
const STAGE_HEADER: Record<string, string> = {
  prospect: 'bg-slate-700',
  qualified: 'bg-blue-800',
  technical_eval: 'bg-purple-800',
  commercial_proposal: 'bg-yellow-800',
  negotiation: 'bg-orange-800',
  won: 'bg-emerald-800',
  lost: 'bg-red-900',
};

export default function PipelinePage() {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/opportunities').then(r => r.json()).then(d => {
      setOpps(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const byStage = (stage: string) => opps.filter((o: any) => o.stage === stage || (stage === 'commercial_proposal' && o.stage === 'proposal'));
  const stageValue = (stage: string) => byStage(stage).reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0);

  if (loading) return <div className="p-6 text-slate-400">Loading pipeline...</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Opportunity Pipeline</h1>
        <p className="text-slate-400 text-sm mt-1">Kanban view — drag deals across stages</p>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {STAGES.map(stage => (
          <div key={stage} className="bg-[#0f1629] border border-[#1e2a45] rounded p-2">
            <div className="text-xs text-slate-400 capitalize">{stage.replace('_', ' ')}</div>
            <div className="text-lg font-bold text-white">{byStage(stage).length}</div>
            <div className="text-xs text-emerald-400">${(stageValue(stage) / 1000).toFixed(0)}K</div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className={`min-w-[220px] w-56 flex-shrink-0 border rounded-lg ${STAGE_COLORS[stage]} border-opacity-50`}>
            <div className={`px-3 py-2 rounded-t-lg ${STAGE_HEADER[stage]}`}>
              <div className="text-xs font-semibold text-white capitalize">{stage.replace(/_/g, ' ')}</div>
              <div className="text-xs text-white/70">{byStage(stage).length} deals · ${(stageValue(stage) / 1000).toFixed(0)}K</div>
            </div>
            <div className="p-2 space-y-2 min-h-[200px] bg-[#0a0e1a]/50 rounded-b-lg">
              {byStage(stage).map((o: any) => (
                <div key={o.id} className="bg-[#0f1629] border border-[#1e2a45] rounded p-2.5 cursor-pointer hover:border-emerald-500/50 transition-colors">
                  <div className="text-xs font-medium text-white leading-tight">{o.title}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-emerald-400 text-xs font-bold">${(parseFloat(o.value_cad) / 1000000).toFixed(1)}M</span>
                    <span className="text-xs text-slate-500">{o.probability}%</span>
                  </div>
                  <div className="text-xs text-blue-400 capitalize mt-1">{o.stream}</div>
                  {o.close_date && <div className="text-xs text-slate-500 mt-1">Close: {new Date(o.close_date).toLocaleDateString()}</div>}
                </div>
              ))}
              {byStage(stage).length === 0 && <div className="text-xs text-slate-600 text-center py-4">No deals</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Opportunities Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]">
          <h2 className="text-sm font-semibold text-white">All Opportunities</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Value (CAD)</th>
              <th className="text-left px-4 py-3">Stream</th>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Stage</th>
              <th className="text-left px-4 py-3">Probability</th>
              <th className="text-left px-4 py-3">Close Date</th>
            </tr>
          </thead>
          <tbody>
            {opps.map((o: any) => (
              <tr key={o.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                <td className="px-4 py-3 text-white font-medium">{o.title}</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">${parseFloat(o.value_cad || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-blue-400 capitalize">{o.stream}</td>
                <td className="px-4 py-3 text-slate-300">{o.product}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${STAGE_HEADER[o.stage] || 'bg-slate-700'}`}>{o.stage?.replace(/_/g,' ')}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-[#1e2a45] rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${o.probability}%` }} />
                    </div>
                    <span className="text-slate-300">{o.probability}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{o.close_date ? new Date(o.close_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
