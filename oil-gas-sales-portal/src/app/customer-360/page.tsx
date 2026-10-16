'use client';
import { useEffect, useState } from 'react';

export default function Customer360Page() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => {
      const a = Array.isArray(d) ? d : [];
      setAccounts(a);
      if (a.length > 0) setSelected(a[0]);
    });
    fetch('/api/activities').then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : []));
  }, []);

  const accountActivities = activities.filter((a: any) => a.related_type === 'account' && selected && a.related_id === selected.id);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Customer 360 View</h1>
        <p className="text-slate-400 text-sm mt-1">All touchpoints, contracts, relationship health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Account List */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 space-y-1">
          <h2 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Accounts</h2>
          {accounts.map((a: any) => (
            <button key={a.id} onClick={() => setSelected(a)}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selected?.id === a.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-[#1e2a45]'}`}>
              {a.company}
            </button>
          ))}
        </div>

        {/* 360 View */}
        <div className="lg:col-span-3 space-y-4">
          {selected ? (
            <>
              {/* Header */}
              <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-2xl font-bold">
                    {selected.company.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">{selected.company}</div>
                    <div className="text-sm text-blue-400 capitalize mt-0.5">{selected.stream} operator</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">${(parseFloat(selected.revenue_cad) / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-slate-400">Total Revenue</div>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Health Score', value: `${selected.health_score}/100`, color: selected.health_score >= 80 ? 'text-emerald-400' : selected.health_score >= 60 ? 'text-yellow-400' : 'text-red-400' },
                  { label: 'Credit Limit', value: `$${(parseFloat(selected.credit_limit_cad || 0) / 1000000).toFixed(1)}M`, color: 'text-white' },
                  { label: 'Payment Terms', value: selected.payment_terms, color: 'text-slate-300' },
                  { label: 'Activities', value: accountActivities.length, color: 'text-blue-400' },
                ].map(k => (
                  <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded p-3 text-center">
                    <div className="text-xs text-slate-400">{k.label}</div>
                    <div className={`text-lg font-bold mt-1 ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Relationship Health */}
              <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Relationship Health Score</h3>
                <div className="space-y-2">
                  {[
                    { metric: 'Payment History', score: 90 },
                    { metric: 'Engagement Level', score: selected.health_score },
                    { metric: 'Contract Coverage', score: 75 },
                    { metric: 'Support Satisfaction', score: 82 },
                    { metric: 'Growth Trajectory', score: 65 },
                  ].map(m => (
                    <div key={m.metric} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-40">{m.metric}</span>
                      <div className="flex-1 bg-[#1e2a45] rounded-full h-2">
                        <div className={`h-2 rounded-full ${m.score >= 80 ? 'bg-emerald-500' : m.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${m.score}%` }} />
                      </div>
                      <span className="text-xs text-white w-8 text-right">{m.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Activity Timeline</h3>
                {accountActivities.length > 0 ? (
                  accountActivities.map((a: any) => (
                    <div key={a.id} className="flex gap-3 pb-3 border-b border-[#1e2a45]/40">
                      <div className="text-lg">📋</div>
                      <div>
                        <div className="text-sm text-white">{a.subject}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{a.notes}</div>
                        <div className="text-xs text-slate-500 mt-1">{new Date(a.ts).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-sm">No activities recorded for this account.</div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-8 text-center text-slate-500">Select an account to view 360</div>
          )}
        </div>
      </div>
    </div>
  );
}
