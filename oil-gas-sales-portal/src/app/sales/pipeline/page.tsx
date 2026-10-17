'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STAGES = ['prospect', 'qualified', 'technical_eval', 'commercial_proposal', 'negotiation', 'won', 'lost'];
const STAGE_COLORS: Record<string, string> = {
  prospect: 'border-slate-600 bg-slate-700/30',
  qualified: 'border-blue-600 bg-blue-900/20',
  technical_eval: 'border-purple-600 bg-purple-900/20',
  commercial_proposal: 'border-yellow-600 bg-yellow-900/20',
  negotiation: 'border-orange-600 bg-orange-900/20',
  won: 'border-emerald-600 bg-emerald-900/20',
  lost: 'border-red-700 bg-red-900/20',
};

export default function SalesPipelinePage() {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/opportunities').then(r => r.json()).then(d => {
      setOpps(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const byStage = STAGES.reduce((acc: Record<string, any[]>, s) => {
    acc[s] = opps.filter(o => o.stage === s);
    return acc;
  }, {});

  const totalPipeline = opps.filter(o => !['won', 'lost'].includes(o.stage))
    .reduce((s, o) => s + parseFloat(o.value_cad || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
            <span>/</span>
            <span className="text-gray-300">Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
          <p className="text-gray-400 mt-1">Total active pipeline: <span className="text-emerald-400 font-semibold">${(totalPipeline / 1_000_000).toFixed(2)}M CAD</span></p>
        </div>
        <Link href="/pipeline" className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-500/30 transition">
          Kanban View →
        </Link>
      </div>

      {loading ? (
        <div className="text-emerald-400">Loading pipeline...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {STAGES.map(stage => (
            <div key={stage} className={`rounded-lg border p-3 ${STAGE_COLORS[stage]}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{stage.replace('_', ' ')}</h3>
                <span className="text-xs text-gray-500">{byStage[stage]?.length || 0}</span>
              </div>
              <div className="text-sm font-bold text-white mb-3">
                ${(byStage[stage]?.reduce((s: number, o: any) => s + parseFloat(o.value_cad || 0), 0) / 1_000_000).toFixed(2)}M
              </div>
              <div className="space-y-2">
                {(byStage[stage] || []).slice(0, 3).map((o: any) => (
                  <div key={o.id} className="bg-[#0a0e1a]/60 rounded p-2">
                    <div className="text-xs text-white font-medium truncate">{o.account_name || o.company}</div>
                    <div className="text-xs text-gray-400">${parseFloat(o.value_cad || 0).toLocaleString()}</div>
                  </div>
                ))}
                {byStage[stage]?.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">+{byStage[stage].length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
