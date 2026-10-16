'use client';
import { useEffect, useState } from 'react';

interface KpiCard {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'ok' | 'warn' | 'critical';
  icon: string;
  change?: string;
}

interface SeedStatus { ok: boolean; seeded?: { use_cases: number; departments: number; digital_twins: number; sensors: number }; error?: string; }

export default function CommandCenter() {
  const [seeded, setSeeded] = useState<SeedStatus | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [health, setHealth] = useState<{ db: string } | null>(null);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth).catch(() => {});
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await fetch('/api/init', { method: 'POST' });
      const d = await r.json();
      setSeeded(d);
    } catch (e) {
      setSeeded({ ok: false, error: String(e) });
    } finally {
      setSeeding(false);
    }
  };

  const kpis: KpiCard[] = [
    { label: 'Active Wells', value: 42, unit: 'producing', status: 'ok', icon: '🛢️', change: '+2 this month' },
    { label: 'Gross Production', value: '45,200', unit: 'BOE/d', status: 'ok', icon: '⛽', change: '+1.2% WoW' },
    { label: 'Pipeline Throughput', value: '245', unit: 'MMscf/d', status: 'ok', icon: '〰️', change: '82% utilization' },
    { label: 'Refinery Utilization', value: '86.7', unit: '%', status: 'ok', icon: '🏭', change: 'CDU-1 online' },
    { label: 'Safety Incidents', value: 0, unit: 'open', status: 'ok', icon: '⛑️', change: 'TRIR: 0.42' },
    { label: 'AI Alerts Active', value: 7, unit: 'alerts', status: 'warn', icon: '🤖', change: '3 critical' },
    { label: 'Digital Twins', value: 8, unit: 'active', status: 'ok', icon: '🔮', change: '7 connected' },
    { label: 'Sensor Network', value: '20,000+', unit: 'sensors', status: 'ok', icon: '📡', change: '99.2% online' },
  ];

  const streamStatus = [
    { name: 'Upstream', icon: '🛢️', status: 'normal', kpi1: '45.2k BOE/d', kpi2: '42 active wells', kpi3: 'TRIR 0.42', color: 'amber' },
    { name: 'Midstream', icon: '🔗', status: 'normal', kpi1: '245 MMscf/d', kpi2: '4 comp. stations', kpi3: '0 leaks', color: 'blue' },
    { name: 'Downstream', icon: '🏭', status: 'normal', kpi1: '95.4k bbl/d', kpi2: '86.7% utilization', kpi3: '3 off-spec MTD', color: 'green' },
  ];

  const recentAlerts = [
    { id: 1, type: 'Predictive Maintenance', stream: 'Midstream', asset: 'Compressor CS-015', severity: 'warn', msg: 'Vibration trend 15% above baseline — bearing wear predicted in 14 days', time: '2 hrs ago' },
    { id: 2, type: 'Safety Alert', stream: 'Upstream', asset: 'Process Area H2S Zone', severity: 'critical', msg: 'H2S reading spike detected — sensors confirm 0.5 ppm, below evacuation threshold', time: '4 hrs ago' },
    { id: 3, type: 'Quality Alert', stream: 'Downstream', asset: 'Product Quality Lab', severity: 'warn', msg: 'Naphtha RVP approaching upper spec limit — blending adjustment recommended', time: '6 hrs ago' },
    { id: 4, type: 'SCADA Anomaly', stream: 'Midstream', asset: 'SCADA Pipeline Trunk', severity: 'info', msg: 'Unusual pressure pattern detected at station MS-07 — under investigation', time: '8 hrs ago' },
    { id: 5, type: 'Production Alert', stream: 'Upstream', asset: 'Well X-12', severity: 'info', msg: 'Production decline rate accelerating — ESP optimization recommended', time: '12 hrs ago' },
  ];

  const severityColor = (s: string) => ({ critical: 'text-red-400 border-red-500/30 bg-red-500/10', warn: 'text-amber-400 border-amber-500/30 bg-amber-500/10', info: 'text-blue-400 border-blue-500/30 bg-blue-500/10' })[s] || 'text-gray-400';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Oil & Gas AI/ML Operations Portal — All Streams • Real-time Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${health?.db === 'connected' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            DB {health?.db ?? 'checking...'}
          </div>
          {!seeded && (
            <button onClick={handleSeed} disabled={seeding}
              className="px-4 py-2 bg-amber-500 text-black text-xs font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors">
              {seeding ? 'Seeding...' : '🌱 Seed Database'}
            </button>
          )}
        </div>
      </div>

      {seeded && (
        <div className={`p-3 rounded-lg border text-sm ${seeded.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {seeded.ok ? `✅ Database seeded: ${seeded.seeded?.use_cases} use cases, ${seeded.seeded?.departments} departments, ${seeded.seeded?.digital_twins} digital twins, ${seeded.seeded?.sensors} sensors` : `❌ Seed error: ${seeded.error}`}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{kpi.icon}</div>
              <div className={`w-2 h-2 rounded-full mt-1 ${kpi.status === 'ok' ? 'bg-green-400' : kpi.status === 'warn' ? 'bg-amber-400' : 'bg-red-400'}`}></div>
            </div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{kpi.unit}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            {kpi.change && <div className="text-xs text-amber-400/70 mt-1">{kpi.change}</div>}
          </div>
        ))}
      </div>

      {/* Stream Status */}
      <div className="grid grid-cols-3 gap-4">
        {streamStatus.map((s) => (
          <div key={s.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{s.icon}</span>
              <span className="font-semibold text-white">{s.name}</span>
              <span className="ml-auto text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Normal</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Production</span><span className="text-white">{s.kpi1}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Assets</span><span className="text-white">{s.kpi2}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Safety</span><span className="text-white">{s.kpi3}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Alerts */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          🤖 AI-Generated Alerts
          <span className="ml-auto text-xs text-gray-500">Live from predictive models & anomaly detectors</span>
        </h2>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${severityColor(alert.severity)}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase">{alert.type}</span>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{alert.stream}</span>
                  <span className="text-xs">•</span>
                  <span className="text-xs font-mono">{alert.asset}</span>
                </div>
                <div className="text-xs text-gray-300">{alert.msg}</div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">{alert.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { href: '/use-cases', label: 'Use Case Registry', desc: '60+ AI/ML use cases', icon: '📋' },
          { href: '/ai/digital-twin', label: 'Digital Twins', desc: '8 active twins', icon: '🔮' },
          { href: '/ai/iot-sensors', label: 'IoT Sensors', desc: '20,000+ sensors', icon: '📡' },
          { href: '/ai/agents', label: 'Agentic AI', desc: 'Autonomous agents', icon: '🕵️' },
        ].map((item) => (
          <a key={item.href} href={item.href} className="bg-[#0f1629] border border-[#1e2a45] hover:border-amber-500/40 rounded-xl p-4 transition-colors group">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
