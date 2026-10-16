'use client';
import { useEffect, useState } from 'react';

interface Twin {
  id: number;
  twin_name: string;
  twin_type: string;
  asset_id: string;
  stream: string;
  sync_status: string;
  health_score: number;
  last_sync: string;
}

const SYNC_COLOR: Record<string, string> = {
  connected: 'text-green-400 bg-green-500/10 border-green-500/30',
  syncing: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  disconnected: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const TYPE_ICON: Record<string, string> = {
  reservoir: '🧪', pipeline: '〰️', compressor: '⚙️', refinery_unit: '🏭',
  well: '🔩', gas_plant: '💨', storage: '🗄️',
};

export default function DigitalTwinPage() {
  const [twins, setTwins] = useState<Twin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/digital-twins').then(r => r.json()).then(d => {
      setTwins(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const connected = twins.filter(t => t.sync_status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Digital Twin Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Active twins: Wells · Compressors · Pipelines · Refineries · Physics models</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{twins.length}</div>
          <div className="text-xs text-gray-500">Total Twins</div>
          <div className="text-xs text-green-400">{connected} connected</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading digital twins...</div>
      ) : twins.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No twins found. Seed the database first.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {twins.map((twin) => (
            <div key={twin.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{TYPE_ICON[twin.twin_type] || '🔮'}</span>
                  <div>
                    <div className="font-medium text-white text-sm">{twin.twin_name}</div>
                    <div className="text-xs text-gray-500">{twin.asset_id} · {twin.stream}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border ${SYNC_COLOR[twin.sync_status] || ''}`}>{twin.sync_status}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Health Score</span>
                    <span className={`font-medium ${twin.health_score >= 85 ? 'text-green-400' : twin.health_score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{twin.health_score}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2a45] rounded-full">
                    <div className={`h-full rounded-full ${twin.health_score >= 85 ? 'bg-green-500' : twin.health_score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${twin.health_score}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600">Last sync: {twin.last_sync ? new Date(twin.last_sync).toLocaleString() : 'Never'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Twin architecture */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Digital Twin Architecture</h2>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            { component: 'Physics Engine', desc: 'Material balance, fluid dynamics, thermodynamics', icon: '⚛️' },
            { component: 'ML Surrogate', desc: 'Replaces expensive simulation with fast neural network', icon: '🧠' },
            { component: 'History Matching', desc: 'Bayesian calibration to real field measurements', icon: '🎯' },
            { component: 'Prediction Engine', desc: 'What-if scenarios, optimization, anomaly detection', icon: '🔮' },
          ].map((c) => (
            <div key={c.component} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="text-amber-400 font-medium">{c.component}</div>
              <div className="text-gray-500 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
