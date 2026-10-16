'use client';
import { useEffect, useState } from 'react';

interface Integration {
  id: number;
  service_name: string;
  service_type: string;
  status: string;
  live_status?: string;
  last_connected: string;
  models?: string[];
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/integrations').then(r => r.json()).then(d => { setIntegrations(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const connected = integrations.filter(i => (i.live_status ?? i.status) === 'connected').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Integration Management</h1>
          <p className="text-gray-400 text-sm mt-1">{connected}/{integrations.length} connected · IoT Broker, Historian, ERP, LIMS, GIS, Vector DB, Ollama</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#1e2a45] hover:bg-[#2a3a5a] text-white rounded-lg text-sm">Refresh Status</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(i => {
          const effectiveStatus = i.live_status ?? i.status;
          const ok = effectiveStatus === 'connected';
          return (
            <div key={i.id} className={`bg-[#0f1629] border rounded-xl p-5 ${ok ? 'border-[#1e2a45]' : 'border-[#1e2a45]'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <div className="text-white font-medium">{i.service_name}</div>
                    <div className="text-gray-400 text-xs">{i.service_type}</div>
                  </div>
                </div>
                <span className={`text-sm font-medium ${ok ? 'text-green-400' : 'text-red-400'}`}>
                  {effectiveStatus}
                </span>
              </div>
              {!ok && (
                <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                  ⚠️ Mocked — not configured. Set corresponding env var to enable.
                </div>
              )}
              {i.models && i.models.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-400 mb-1">Available Models:</div>
                  <div className="flex flex-wrap gap-1">
                    {i.models.map(m => <span key={m} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-mono">{m}</span>)}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Last connected: {i.last_connected ? new Date(i.last_connected).toLocaleString() : 'Never'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
