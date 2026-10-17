'use client';
import { useEffect, useState } from 'react';

interface DashData {
  total_segments: number;
  avg_thickness_mm: number;
  high_corrosion_count: number;
  condition_good: number;
  condition_fair: number;
  condition_poor: number;
  condition_critical: number;
  monthly_corrosion: { month: string; avg_pct: number }[];
  thickness_by_material: { material: string; avg_mm: number }[];
  alerts: { severity: string; message: string; ts: string }[];
}

export default function PipelineIntegrityDashboard() {
  const [d, setD] = useState<DashData | null>(null);

  useEffect(() => {
    fetch('/api/midstream/pipeline-integrity/dashboard').then(r => r.json()).then(setD);
  }, []);

  const conditionTotal = d ? (d.condition_good + d.condition_fair + d.condition_poor + d.condition_critical) || 1 : 1;
  const conditionSlices = d ? [
    { label: 'Good', count: d.condition_good, color: '#22c55e' },
    { label: 'Fair', count: d.condition_fair, color: '#f59e0b' },
    { label: 'Poor', count: d.condition_poor, color: '#f97316' },
    { label: 'Critical', count: d.condition_critical, color: '#ef4444' },
  ] : [];

  // Build SVG pie
  const buildPie = () => {
    let cumulative = 0;
    const r = 40;
    const cx = 50; const cy = 50;
    return conditionSlices.map((s) => {
      const pct = s.count / conditionTotal;
      const start = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += pct;
      const end = cumulative * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const large = pct > 0.5 ? 1 : 0;
      return { ...s, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` };
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pipeline Integrity — Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time corrosion, thickness, and condition KPIs</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Pipe Segments', value: d ? d.total_segments.toLocaleString() : '—', icon: '〰️', unit: 'segments' },
          { label: 'Avg Thickness', value: d ? `${d.avg_thickness_mm?.toFixed(2)} mm` : '—', icon: '📏', unit: 'mm' },
          { label: 'High Corrosion >20%', value: d ? d.high_corrosion_count.toLocaleString() : '—', icon: '⚠️', unit: 'segments' },
          { label: 'Critical Condition', value: d ? d.condition_critical.toLocaleString() : '—', icon: '🔴', unit: 'segments' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-amber-400">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Condition Distribution Pie */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Condition Distribution</h2>
          {d ? (
            <>
              <svg viewBox="0 0 100 100" className="w-32 h-32 mx-auto">
                {buildPie().map((s) => (
                  <path key={s.label} d={s.d} fill={s.color} />
                ))}
              </svg>
              <div className="mt-3 space-y-1">
                {conditionSlices.map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}></div>
                    <span className="text-gray-400">{s.label}</span>
                    <span className="text-white ml-auto">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="text-gray-500 text-sm text-center py-8">Run Import to load data</div>}
        </div>

        {/* Monthly corrosion line chart */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Avg Corrosion % by Month</h2>
          {d && d.monthly_corrosion?.length > 0 ? (
            <svg viewBox="0 0 300 100" className="w-full">
              {d.monthly_corrosion.map((pt, i) => {
                const maxV = Math.max(...d.monthly_corrosion.map(p => p.avg_pct)) || 1;
                const x = (i / (d.monthly_corrosion.length - 1)) * 280 + 10;
                const y = 90 - (pt.avg_pct / maxV) * 80;
                return (
                  <g key={i}>
                    {i > 0 && (
                      <line
                        x1={(((i - 1) / (d.monthly_corrosion.length - 1)) * 280) + 10}
                        y1={90 - (d.monthly_corrosion[i - 1].avg_pct / maxV) * 80}
                        x2={x} y2={y}
                        stroke="#f59e0b" strokeWidth="2"
                      />
                    )}
                    <circle cx={x} cy={y} r="3" fill="#f59e0b" />
                  </g>
                );
              })}
            </svg>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>

        {/* Thickness by material bar */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Avg Thickness by Material</h2>
          {d && d.thickness_by_material?.length > 0 ? (
            <div className="space-y-2">
              {d.thickness_by_material.slice(0, 6).map((m) => {
                const maxV = Math.max(...d.thickness_by_material.map(x => x.avg_mm)) || 1;
                return (
                  <div key={m.material} className="flex items-center gap-2 text-xs">
                    <div className="text-gray-400 w-24 truncate">{m.material}</div>
                    <div className="flex-1 bg-[#1e2a45] rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${(m.avg_mm / maxV) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-amber-400 w-12 text-right">{m.avg_mm?.toFixed(1)}</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>
      </div>

      {/* Alert feed */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Alert Feed</h2>
        {d?.alerts?.length ? (
          <div className="space-y-2">
            {d.alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b border-[#1e2a45]/30 pb-2">
                <span className={a.severity === 'critical' ? 'text-red-400' : a.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}>
                  {a.severity === 'critical' ? '🔴' : '⚠️'}
                </span>
                <div>
                  <div className="text-gray-300">{a.message}</div>
                  <div className="text-xs text-gray-600">{a.ts}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No active alerts. Import data to see alerts.</div>
        )}
      </div>
    </div>
  );
}
