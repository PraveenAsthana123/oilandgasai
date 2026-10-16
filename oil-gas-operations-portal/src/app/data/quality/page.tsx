'use client';
import { useEffect, useState } from 'react';

interface DQRecord { table_name: string; row_count: number; completeness_pct: number; freshness_minutes: number; validity_pct: number; checked_at: string; }

export default function DataQualityPage() {
  const [data, setData] = useState<DQRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data/quality').then(r => r.json()).then(d => {
      setData(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const overall = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.completeness_pct, 0) / data.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Quality Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Completeness · Freshness · Validity — real DB queries per table</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-amber-400">{overall}%</div>
          <div className="text-xs text-gray-500">Overall Quality Score</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Checking data quality...</div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.table_name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-amber-400 text-sm">{d.table_name}</div>
                <div className="text-xs text-gray-500">{d.row_count.toLocaleString()} rows</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Completeness', value: d.completeness_pct, color: d.completeness_pct >= 95 ? 'bg-green-500' : d.completeness_pct >= 80 ? 'bg-amber-500' : 'bg-red-500', textColor: d.completeness_pct >= 95 ? 'text-green-400' : 'text-amber-400' },
                  { label: 'Validity', value: d.validity_pct, color: d.validity_pct >= 95 ? 'bg-green-500' : 'bg-amber-500', textColor: d.validity_pct >= 95 ? 'text-green-400' : 'text-amber-400' },
                  { label: 'Freshness', value: Math.max(0, 100 - d.freshness_minutes), color: d.freshness_minutes < 60 ? 'bg-green-500' : d.freshness_minutes < 1440 ? 'bg-amber-500' : 'bg-red-500', textColor: d.freshness_minutes < 60 ? 'text-green-400' : 'text-amber-400', subtitle: `${d.freshness_minutes} min ago` },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{m.label}</span>
                      <span className={m.textColor}>{m.value.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#1e2a45] rounded-full">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.value}%` }}></div>
                    </div>
                    {m.subtitle && <div className="text-xs text-gray-600 mt-0.5">{m.subtitle}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
