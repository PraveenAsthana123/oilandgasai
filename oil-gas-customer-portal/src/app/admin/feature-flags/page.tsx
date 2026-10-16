'use client';
import { useEffect, useState } from 'react';

interface Flag { id: number; flag_name: string; enabled: boolean; description: string; updated_at: string }

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/feature-flags').then(r => r.json()).then(d => setFlags(d.flags || []));
  }, []);

  async function toggle(id: number, enabled: boolean) {
    const r = await fetch('/api/feature-flags', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, enabled: !enabled }) });
    const d = await r.json();
    if (d.flag) {
      setFlags(prev => prev.map(f => f.id === id ? d.flag : f));
      setMsg('Feature flag updated');
      setTimeout(() => setMsg(''), 2000);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
        <p className="text-gray-400 mt-1">Enable/disable portal features per module</p>
      </div>
      {msg && <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-3 text-green-400 text-sm">{msg}</div>}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl divide-y divide-[#1e2a45]/50">
        {flags.length === 0 && <div className="p-8 text-center text-gray-500">Loading flags... (ensure /api/init was called)</div>}
        {flags.map(f => (
          <div key={f.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-gray-200 font-medium">{f.flag_name}</div>
              <div className="text-gray-500 text-xs">{f.description}</div>
            </div>
            <button onClick={() => toggle(f.id, f.enabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${f.enabled ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${f.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
