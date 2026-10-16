'use client';
import { useEffect, useState } from 'react';

interface PerfData {
  on_time_rate: number; quality_rate: number; invoice_accuracy: number;
  trif: number; lti_rate: number; overall_score: number;
  trend: { month: string; score: number }[];
  benchmarks: { on_time_industry: number; quality_industry: number; invoice_industry: number };
}

function KPIBar({ label, value, benchmark, unit = '%' }: { label: string; value: number; benchmark?: number; unit?: string }) {
  const vs = benchmark ? (value >= benchmark ? 'text-green-400' : 'text-red-400') : 'text-white';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={`font-medium ${vs}`}>{value}{unit}</span>
      </div>
      <div className="h-2 bg-[#1e2a45] rounded-full overflow-hidden">
        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      {benchmark && (
        <div className="text-xs text-gray-500">Industry avg: {benchmark}{unit} — {value >= benchmark ? '▲ Above' : '▼ Below'} Average</div>
      )}
    </div>
  );
}

export default function PerformancePage() {
  const [data, setData] = useState<PerfData | null>(null);

  useEffect(() => {
    fetch('/api/performance').then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-purple-400 animate-pulse">Loading scorecard...</div>;

  const scoreColor = data.overall_score >= 4 ? 'text-green-400' : data.overall_score >= 3 ? 'text-yellow-400' : 'text-red-400';
  const maxScore = Math.max(...data.trend.map((t) => t.score));
  const minScore = Math.min(...data.trend.map((t) => t.score));
  const range = maxScore - minScore || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance Scorecard</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time KPIs computed from purchase orders and invoices</p>
      </div>

      {/* Overall Score */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-6 flex items-center gap-6">
        <div className={`text-6xl font-bold ${scoreColor}`}>{data.overall_score}</div>
        <div>
          <div className="text-gray-400 text-sm">Overall Performance Score</div>
          <div className="text-gray-500 text-xs">Out of 5.0 — weighted average of KPIs</div>
          <div className="flex mt-2 gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= data.overall_score ? 'text-yellow-400' : 'text-gray-600'}>★</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Bars */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-5">
        <h2 className="text-white font-semibold">Key Performance Indicators</h2>
        <KPIBar label="On-Time Delivery %" value={data.on_time_rate} benchmark={data.benchmarks.on_time_industry} />
        <KPIBar label="Quality Acceptance Rate %" value={data.quality_rate} benchmark={data.benchmarks.quality_industry} />
        <KPIBar label="Invoice Accuracy %" value={data.invoice_accuracy} benchmark={data.benchmarks.invoice_industry} />
        <KPIBar label="TRIF (Target: < 1.0)" value={data.trif} unit="" />
        <KPIBar label="LTI Rate (Target: < 0.5)" value={data.lti_rate} unit="" />
      </div>

      {/* Trend Chart */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5">
        <h2 className="text-white font-semibold mb-4">12-Month Performance Trend</h2>
        <div className="relative h-40">
          <svg viewBox="0 0 600 120" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </linearGradient>
            </defs>
            {data.trend.map((point, i) => {
              const x = (i / (data.trend.length - 1)) * 580 + 10;
              const y = 100 - ((point.score - minScore) / range) * 80;
              const nextPoint = data.trend[i + 1];
              const nx = ((i + 1) / (data.trend.length - 1)) * 580 + 10;
              const ny = nextPoint ? 100 - ((nextPoint.score - minScore) / range) * 80 : y;
              return (
                <g key={i}>
                  {i < data.trend.length - 1 && <line x1={x} y1={y} x2={nx} y2={ny} stroke="#7c3aed" strokeWidth="2" />}
                  <circle cx={x} cy={y} r="4" fill="#7c3aed" />
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {data.trend.map((t) => <span key={t.month}>{t.month}</span>)}
          </div>
        </div>
      </div>

      {/* Safety Stats */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5">
        <h2 className="text-white font-semibold mb-3">Safety Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'TRIF', value: data.trif, target: '< 1.0', good: data.trif < 1.0 },
            { label: 'LTI Rate', value: data.lti_rate, target: '< 0.5', good: data.lti_rate < 0.5 },
            { label: 'Incidents', value: 0, target: 'Target: 0', good: true },
            { label: 'Safety Audits', value: 2, target: 'This year', good: true },
          ].map((s) => (
            <div key={s.label} className={`p-3 rounded-lg border ${s.good ? 'border-green-800 bg-green-900/10' : 'border-red-800 bg-red-900/10'}`}>
              <div className={`text-2xl font-bold ${s.good ? 'text-green-400' : 'text-red-400'}`}>{s.value}</div>
              <div className="text-white text-sm">{s.label}</div>
              <div className="text-gray-500 text-xs">{s.target}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
