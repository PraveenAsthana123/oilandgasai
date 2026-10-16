'use client';
import { useEffect, useState } from 'react';

interface Opportunity { id: number; title: string; value: number; stage: string; probability: number; created_at: string }

const STAGE_ORDER = ['prospect', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export default function PipelinePage() {
  const [opps, setOpps] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetch('/api/opportunities').then(r => r.json()).then(d => setOpps(d.opportunities || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
        <p className="text-gray-400 mt-1">Opportunity stages and weighted pipeline</p>
      </div>

      <div className="grid gap-4">
        {STAGE_ORDER.filter(s => opps.some(o => o.stage === s)).map(stage => (
          <div key={stage} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 capitalize">{stage.replace('_', ' ')}</div>
            {opps.filter(o => o.stage === stage).map(opp => (
              <div key={opp.id} className="flex items-center justify-between py-2 border-b border-[#1e2a45]/50">
                <div className="text-gray-200 text-sm">{opp.title}</div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-xs">{opp.probability}% probability</span>
                  <span className="text-white font-semibold">${Number(opp.value).toLocaleString('en-CA', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
