'use client';
import { useEffect, useState } from 'react';

interface DashData {
  active_devices: number;
  avg_co_ppm: number;
  lpg_above_threshold: number;
  total_readings: number;
  temp_trend: { device: string; avg_temp: number }[];
  co_by_device: { device: string; avg_co: number }[];
  alerts: { severity: string; message: string; ts: string }[];
}

export default function GasCompressionDashboard() {
  const [d, setD] = useState<DashData | null>(null);

  useEffect(() => {
    fetch('/api/midstream/gas-compression/dashboard').then(r => r.json()).then(setD);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gas Compression — Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">IoT telemetry KPIs: CO, LPG, temperature, device health</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Devices', value: d ? d.active_devices.toString() : '—', icon: '📡', unit: 'sensors' },
          { label: 'Avg CO ppm', value: d ? d.avg_co_ppm.toFixed(4) : '—', icon: '💨', unit: 'ppm' },
          { label: 'LPG Above Threshold', value: d ? d.lpg_above_threshold.toLocaleString() : '—', icon: '⚠️', unit: '>0.007' },
          { label: 'Total Readings', value: d ? d.total_readings.toLocaleString() : '—', icon: '📊', unit: 'data points' },
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
        {/* Temp trend bar chart */}
        <div className="col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Avg Temperature by Device (°C)</h2>
          {d && d.temp_trend?.length > 0 ? (
            <div className="space-y-2">
              {d.temp_trend.slice(0, 8).map((dev) => {
                const maxT = Math.max(...d.temp_trend.map(x => x.avg_temp)) || 1;
                return (
                  <div key={dev.device} className="flex items-center gap-2 text-xs">
                    <div className="text-gray-400 w-36 truncate font-mono">{dev.device}</div>
                    <div className="flex-1 bg-[#1e2a45] rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(dev.avg_temp / maxT) * 100}%` }}></div>
                    </div>
                    <div className="text-amber-400 w-14 text-right">{dev.avg_temp?.toFixed(1)}°C</div>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-gray-500 text-sm text-center py-8">Import data to view</div>}
        </div>
        {/* CO by device */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">Avg CO by Device</h2>
          {d && d.co_by_device?.length > 0 ? (
            <svg viewBox="0 0 200 160" className="w-full">
              {d.co_by_device.slice(0, 5).map((dev, i) => {
                const maxCO = Math.max(...d.co_by_device.map(x => x.avg_co)) || 1;
                const barH = (dev.avg_co / maxCO) * 100;
                const x = 20 + i * 36;
                return (
                  <g key={dev.device}>
                    <rect x={x} y={150 - barH} width="26" height={barH} fill="#f59e0b" rx="2" />
                    <text x={x + 13} y="155" textAnchor="middle" fill="#6b7280" fontSize="7">D{i + 1}</text>
                  </g>
                );
              })}
            </svg>
          ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
        </div>
      </div>
      {/* LPG trend line */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Alert Feed</h2>
        {d?.alerts?.length ? (
          <div className="space-y-2">
            {d.alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b border-[#1e2a45]/30 pb-2">
                <span>{a.severity === 'critical' ? '🔴' : '⚠️'}</span>
                <div><div className="text-gray-300">{a.message}</div><div className="text-xs text-gray-600">{a.ts}</div></div>
              </div>
            ))}
          </div>
        ) : <div className="text-gray-500 text-sm">No active alerts. Import data to see alerts.</div>}
      </div>
    </div>
  );
}
