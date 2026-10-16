'use client';
import { useEffect, useState } from 'react';

export default function QualityPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/downstream/quality').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Product Quality</h1>
        <p className="text-gray-400 text-sm mt-1">Lab LIMS · Spec prediction · Blending optimization · Contamination detection</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Lab Tests Today', value: d ? String(d.lab_tests_today) : '—', icon: '🔬' },
          { label: 'Off-spec Batches MTD', value: d ? String(d.off_spec_batches_mtd) : '—', icon: '⚠️' },
          { label: 'Spec Compliance', value: d ? `${d.spec_compliance_pct}%` : '—', icon: '✅' },
          { label: 'Turnaround Time', value: d ? `${d.turnaround_time_hrs} hrs` : '—', icon: '⏱️' },
          { label: 'Contamination Alerts', value: d ? String(d.contamination_alerts) : '—', icon: '🔴' },
          { label: 'Inline Analyzers', value: d ? String(d.inline_analyzers) : '—', icon: '📡' },
          { label: 'Analyzer Uptime', value: d ? `${d.analyzer_uptime_pct}%` : '—', icon: '📊' },
          { label: 'Customer Complaints YTD', value: d ? String(d.customer_complaints_ytd) : '—', icon: '📬' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
