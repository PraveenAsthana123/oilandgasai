'use client';
import { useEffect, useState } from 'react';

export default function SCADAPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { fetch('/api/midstream/scada').then(r => r.json()).then(d => setData(d.metrics)); }, []);
  const d = data as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">SCADA & Control</h1>
        <p className="text-gray-400 text-sm mt-1">Alarm management · Anomaly detection · Control loop optimization · Cybersecurity</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total SCADA Tags', value: d ? `${(d.total_tags as number)?.toLocaleString()}` : '—', icon: '🖥️', unit: 'monitored' },
          { label: 'Alarm Rate', value: d ? `${d.alarm_rate_per_hr}/hr` : '—', icon: '🔔', unit: 'per operator' },
          { label: 'Control Loop Auto', value: d ? `${d.auto_pct}%` : '—', icon: '🔄', unit: 'in auto mode' },
          { label: 'System Uptime', value: d ? `${d.uptime_pct}%` : '—', icon: '✅', unit: 'availability' },
          { label: 'Control Loops Total', value: d ? String(d.control_loops_total) : '—', icon: '⚙️', unit: 'loops' },
          { label: 'Loops in Auto', value: d ? String(d.control_loops_in_auto) : '—', icon: '🤖', unit: 'automated' },
          { label: 'Cyber Alerts', value: d ? String(d.cybersecurity_alerts) : '—', icon: '🔒', unit: 'active' },
          { label: 'Response Time', value: d ? `${d.response_time_ms} ms` : '—', icon: '⚡', unit: 'avg latency' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Alarm Management — AI Rationalization</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Nuisance Alarms', value: '34%', desc: 'Identified by ML clustering for suppression', color: 'text-amber-400' },
            { label: 'Standing Alarms', value: '8', desc: 'Persistent alarms requiring engineering review', color: 'text-red-400' },
            { label: 'Chattering Alarms', value: '12', desc: 'Rapid cycling — dead band adjustment needed', color: 'text-amber-400' },
            { label: 'After Rationalization', value: '74% reduction', desc: 'Target alarm rate: <1/hr/operator', color: 'text-green-400' },
          ].map((item) => (
            <div key={item.label} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="flex justify-between items-start">
                <span className="text-gray-300">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
              <div className="text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
