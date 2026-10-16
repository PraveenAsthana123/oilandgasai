'use client';
import { useEffect, useState } from 'react';

interface EmsRecord {
  id: number;
  record_type: string;
  category: string;
  value: number;
  unit: string;
  quota: number;
  period_start: string;
  period_end: string;
}

export default function EMSPage() {
  const [records, setRecords] = useState<EmsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ems').then(r => r.json()).then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const pct = (val: number, quota: number) => quota > 0 ? Math.min((val / quota) * 100, 100) : 0;
  const pctColor = (p: number) => p > 100 ? 'bg-red-500' : p > 80 ? 'bg-yellow-500' : 'bg-green-500';
  const textColor = (p: number) => p > 100 ? 'text-red-400' : p > 80 ? 'text-yellow-400' : 'text-green-400';

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Environmental Management System</h1>
        <p className="text-gray-400 text-sm mt-1">Emission quotas vs actuals, spill register, waste management, water usage, carbon intensity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {records.map(r => {
          const p = pct(r.value, r.quota);
          const exceedingQuota = r.quota > 0 && r.value > r.quota;
          return (
            <div key={r.id} className={`bg-[#0f1629] border rounded-xl p-5 ${exceedingQuota ? 'border-red-500/40' : 'border-[#1e2a45]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{r.category}</div>
                  <div className="text-gray-400 text-xs capitalize">{r.record_type.replace(/_/g, ' ')}</div>
                </div>
                {exceedingQuota && <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30">Over Quota</span>}
              </div>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className={`text-2xl font-bold ${textColor(p)}`}>{r.value.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-1">{r.unit}</span>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>Quota: {r.quota.toLocaleString()}</div>
                  <div className={textColor(p)}>{r.quota > 0 ? `${p.toFixed(1)}%` : 'No quota'}</div>
                </div>
              </div>
              {r.quota > 0 && (
                <div className="h-2 bg-[#1e2a45] rounded-full">
                  <div className={`h-2 rounded-full transition-all ${pctColor(p)}`} style={{ width: `${Math.min(p, 100)}%` }} />
                </div>
              )}
              <div className="text-gray-500 text-xs mt-2">
                {r.period_start ? new Date(r.period_start).toLocaleDateString() : ''} – {r.period_end ? new Date(r.period_end).toLocaleDateString() : ''}
              </div>
            </div>
          );
        })}
      </div>
      {records.length === 0 && <div className="text-center py-12 text-gray-500">No EMS records — initialize DB first</div>}
    </div>
  );
}
