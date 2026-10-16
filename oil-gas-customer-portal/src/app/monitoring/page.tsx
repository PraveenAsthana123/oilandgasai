'use client';
import { useEffect, useState } from 'react';

interface Asset {
  id: number;
  customer_id: number;
  company: string;
  asset_type: string;
  asset_name: string;
  health_score: number;
  alert_count: number;
  last_scan: string;
  status: string;
}

interface Summary {
  [key: string]: { count: number; alerts: number; assets: Asset[] };
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[#1e2a45] rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${score >= 90 ? 'text-green-400' : score >= 75 ? 'text-amber-400' : 'text-red-400'}`}>{score}%</span>
    </div>
  );
}

const ASSET_ICONS: Record<string, string> = {
  well: '⛽',
  pipeline: '🔩',
  equipment: '⚙️',
};

export default function MonitoringPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [isMocked, setIsMocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/monitoring/assets').then(r => r.json()).then(d => {
      setAssets(d.assets || []);
      setSummary(d.summary || {});
      setIsMocked(d._mock || false);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-400">Loading asset monitoring...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Asset Monitoring</h1>
        <p className="text-gray-400 mt-1">Read-only view of AI monitoring status for your assets</p>
      </div>

      <div className="bg-amber-900/20 border border-amber-600/40 rounded-xl p-4 text-amber-400">
        ⚠ Live integration unavailable — set <code className="bg-amber-900/40 px-1 rounded">OPERATIONS_API_URL</code> in environment to connect to live monitoring platform
        {isMocked && <span className="ml-2 text-xs">(Showing seeded demo data)</span>}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(summary).map(([type, s]) => (
          <div key={type} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{ASSET_ICONS[type] || '🔧'}</span>
              <div>
                <div className="text-white font-semibold capitalize">{type}s</div>
                <div className="text-gray-400 text-sm">{s.count} monitored</div>
              </div>
            </div>
            {s.alerts > 0 ? (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-2 text-red-400 text-sm">
                {s.alerts} active alert{s.alerts > 1 ? 's' : ''}
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-2 text-green-400 text-sm">
                All clear
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Asset Detail Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a45]">
          <h2 className="text-white font-semibold">Asset Detail</h2>
        </div>
        <div className="divide-y divide-[#1e2a45]/50">
          {assets.map(a => (
            <div key={a.id} className="px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ASSET_ICONS[a.asset_type] || '🔧'}</span>
                  <div>
                    <div className="text-white font-medium">{a.asset_name}</div>
                    <div className="text-gray-400 text-xs capitalize">{a.asset_type} · {a.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.alert_count > 0 && (
                    <span className="bg-red-500/20 text-red-400 text-xs border border-red-600/30 px-2 py-1 rounded">
                      {a.alert_count} alert{a.alert_count > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    a.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                    a.status === 'maintenance_due' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{a.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="ml-10">
                <div className="text-gray-500 text-xs mb-1">Health Score</div>
                <HealthBar score={a.health_score} />
                <div className="text-gray-600 text-xs mt-1">
                  Last scan: {new Date(a.last_scan).toLocaleString('en-CA')} · AI model: llama3.2
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
