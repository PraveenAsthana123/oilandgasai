'use client';
import { useEffect, useState } from 'react';

interface DashData {
  total_readings: number;
  anomaly_count: number;
  device_count: number;
  alert_rate_pct: number;
  anomaly_trend: { device: string; anomalies: number }[];
  readings_over_time: { hour: number; count: number }[];
  alerts: { severity: string; message: string; ts: string }[];
}

export default function ScadaControlDashboard() {
  const [d, setD] = useState<DashData | null>(null);
  useEffect(() => { fetch('/api/midstream/scada-control/dashboard').then(r => r.json()).then(setD); }, []);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-2xl font-bold text-white">SCADA Control — Dashboard</h1><p className="text-gray-400 text-sm mt-1">Sensor readings, anomaly counts, device inventory, alarm rates</p></div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Sensor Readings', value: d ? d.total_readings.toLocaleString() : '—', icon: '📡', unit: 'data points' },
          { label: 'Anomaly Count', value: d ? d.anomaly_count.toLocaleString() : '—', icon: '🚨', unit: 'CO>0.006 or LPG>0.007' },
          { label: 'Device Count', value: d ? d.device_count.toString() : '—', icon: '🖥️', unit: 'RTUs/sensors' },
          { label: 'Alert Rate', value: d ? `${d.alert_rate_pct.toFixed(2)}%` : '—', icon: '📊', unit: 'anomaly/total' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-amber-400">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Anomaly by device */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Anomalies per Device</h2>
          {d && d.anomaly_trend?.length > 0 ? (
            <div className="space-y-2">
              {d.anomaly_trend.slice(0, 6).map(dev => {
                const maxV = Math.max(...d.anomaly_trend.map(x => x.anomalies)) || 1;
                return (
                  <div key={dev.device} className="flex items-center gap-2 text-xs">
                    <div className="text-gray-400 w-36 truncate font-mono">{dev.device}</div>
                    <div className="flex-1 bg-[#1e2a45] rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${(dev.anomalies / maxV) * 100}%` }}></div></div>
                    <div className="text-red-400 w-8 text-right">{dev.anomalies}</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">Import data to view</div>}
        </div>
        {/* Readings by hour SVG bar */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Reading Distribution</h2>
          {d && d.readings_over_time?.length > 0 ? (
            <svg viewBox="0 0 240 100" className="w-full">
              {d.readings_over_time.slice(0, 12).map((pt, i) => {
                const maxV = Math.max(...d.readings_over_time.map(p => p.count)) || 1;
                const barH = (pt.count / maxV) * 80;
                const x = i * 20;
                return (
                  <g key={i}>
                    <rect x={x + 2} y={90 - barH} width="16" height={barH} fill="#f59e0b" rx="2" />
                    <text x={x + 10} y={98} textAnchor="middle" fill="#6b7280" fontSize="6">D{i + 1}</text>
                  </g>
                );
              })}
            </svg>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">SCADA Alert Feed</h2>
        {d?.alerts?.length ? d.alerts.map((a, i) => (<div key={i} className="flex gap-3 text-sm border-b border-[#1e2a45]/30 pb-2"><span>{a.severity==='critical'?'🔴':'⚠️'}</span><div><div className="text-gray-300">{a.message}</div><div className="text-xs text-gray-600">{a.ts}</div></div></div>)) : <div className="text-gray-500 text-sm">No active alerts. Import data to see SCADA alerts.</div>}
      </div>
    </div>
  );
}
