'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashData {
  empty?: boolean; message?: string;
  kpis?: { total_readings: string; avg_gas_ppm: string; max_depth_m: string; max_gas_ppm: string; };
  gasTypeDistribution?: { gas_type: string; cnt: string }[];
  topGasPeaks?: { depth_m: string; total_gas_ppm: string; gas_type: string }[];
  depthTrend?: { depth_bucket: string; avg_gas: string }[];
}

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-gray-500 text-xs text-center py-8">No data</div>;
  let cumAngle = 0;
  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const start = cumAngle; cumAngle += angle;
    return { ...d, startAngle: start, angle };
  });
  const toXY = (cx: number, cy: number, r: number, deg: number) => {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  return (
    <svg viewBox="0 0 200 160" className="w-full h-40">
      {slices.map((s, i) => {
        const [x1, y1] = toXY(80, 80, 60, s.startAngle);
        const [x2, y2] = toXY(80, 80, 60, s.startAngle + s.angle);
        const large = s.angle > 180 ? 1 : 0;
        const d = `M80,80 L${x1},${y1} A60,60 0 ${large},1 ${x2},${y2} Z`;
        return <path key={i} d={d} fill={s.color} opacity={0.85} stroke="#0a0e1a" strokeWidth="1" />;
      })}
      {slices.map((s, i) => {
        const [lx, ly] = toXY(80, 80, 40, s.startAngle + s.angle / 2);
        return s.angle > 20 ? <text key={i} x={lx} y={ly} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{Math.round((s.value / total) * 100)}%</text> : null;
      })}
      <g transform="translate(150,20)">
        {slices.map((s, i) => (
          <g key={i} transform={`translate(0,${i * 18})`}>
            <rect x={0} y={0} width={10} height={10} fill={s.color} rx={2} />
            <text x={14} y={9} fill="#9ca3af" fontSize="9">{s.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 200, h = 120, pad = 30, barW = Math.floor((w - pad * 2) / data.length) - 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      {data.map((d, i) => {
        const bh = ((d.value / max) * (h - pad - 10));
        const x = pad + i * (barW + 2);
        const y = h - pad - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} fill="#f59e0b" rx={2} opacity={0.8} />
            <text x={x + barW / 2} y={h - 4} textAnchor="middle" fill="#9ca3af" fontSize="7">{d.label.substring(0, 6)}</text>
          </g>
        );
      })}
      <line x1={pad} y1={10} x2={pad} y2={h - pad} stroke="#1e2a45" />
      <line x1={pad} y1={h - pad} x2={w - 10} y2={h - pad} stroke="#1e2a45" />
    </svg>
  );
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length < 2) return <div className="text-gray-500 text-xs text-center py-8">Insufficient data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 220, h = 100, pad = 20;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - d.value / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
      <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + (1 - d.value / max) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#f59e0b" />;
      })}
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#1e2a45" />
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#1e2a45" />
    </svg>
  );
}

const COLORS = ['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function DrillingDashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/upstream/drilling-engineering/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-amber-400">Loading...</div>;

  if (!data || data.empty) return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">{data?.message ?? 'No data available'}</p>
        <button onClick={() => router.push('/upstream/drilling-engineering/jobs')} className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg">Run Import Job</button>
      </div>
    </div>
  );

  const kpis = data.kpis!;
  const gasTypePie = (data.gasTypeDistribution ?? []).map((g, i) => ({ label: g.gas_type, value: parseInt(g.cnt), color: COLORS[i % COLORS.length] }));
  const depthBar = (data.depthTrend ?? []).slice(0, 10).map(d => ({ label: `${d.depth_bucket}m`, value: parseFloat(d.avg_gas) }));
  const topPeaksLine = (data.topGasPeaks ?? []).map(d => ({ label: `${d.depth_m}m`, value: parseFloat(d.total_gas_ppm) }));

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">Drilling Engineering — Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Gas Readings', value: parseInt(kpis.total_readings).toLocaleString(), unit: 'records' },
            { label: 'Avg Total Gas', value: parseFloat(kpis.avg_gas_ppm).toLocaleString(), unit: 'ppm' },
            { label: 'Max Depth Sampled', value: parseFloat(kpis.max_depth_m).toLocaleString(), unit: 'm' },
            { label: 'Max Gas Peak', value: parseFloat(kpis.max_gas_ppm).toLocaleString(), unit: 'ppm' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{k.label}</p>
              <p className="text-2xl font-bold text-amber-400">{k.value}</p>
              <p className="text-xs text-gray-500">{k.unit}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Gas Type Distribution</h3>
            <PieChart data={gasTypePie} />
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Avg Gas by Depth Bucket</h3>
            <BarChart data={depthBar} />
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Top Gas Peaks (by depth)</h3>
            <LineChart data={topPeaksLine} />
          </div>
        </div>

        {/* Top Gas Peaks Table */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Top 10 Gas Peaks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[#1e2a45]">
                {['Depth (m)','Total Gas (ppm)','Gas Type'].map(h => <th key={h} className="py-2 px-3 text-amber-400 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {(data.topGasPeaks ?? []).map((r, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50">
                    <td className="py-2 px-3 text-gray-300">{r.depth_m}</td>
                    <td className="py-2 px-3 text-amber-300 font-semibold">{parseFloat(r.total_gas_ppm).toLocaleString()}</td>
                    <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs ${r.gas_type === 'FG' ? 'bg-amber-900/40 text-amber-300' : 'bg-blue-900/40 text-blue-300'}`}>{r.gas_type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
