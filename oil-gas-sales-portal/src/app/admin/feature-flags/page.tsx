'use client';
import { useEffect, useState } from 'react';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/feature-flags').then(r => r.json()).then(d => { setFlags(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const toggle = async (id: number, enabled: boolean) => {
    await fetch(`/api/admin/feature-flags/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !enabled }) });
    setFlags(f => f.map((ff: any) => ff.id === id ? { ...ff, enabled: !enabled } : ff));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
      <p className="text-slate-400 text-sm">Toggle features on/off per portal configuration</p>
      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="space-y-3">
          {flags.map((f: any) => (
            <div key={f.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{f.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{f.description}</div>
              </div>
              <button onClick={() => toggle(f.id, f.enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${f.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${f.enabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
          {flags.length === 0 && <div className="text-slate-500 text-sm text-center py-8">No feature flags. <a href="/api/init" className="text-emerald-400 underline">Initialize database</a></div>}
        </div>
      )}
    </div>
  );
}
