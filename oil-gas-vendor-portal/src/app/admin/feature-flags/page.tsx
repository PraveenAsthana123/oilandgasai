'use client';
import { useEffect, useState } from 'react';

interface Flag { id: number; name: string; enabled: boolean; description: string; }

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);

  useEffect(() => {
    fetch('/api/admin/feature-flags').then((r) => r.json()).then((d) => setFlags(d.flags || []));
  }, []);

  const toggle = async (name: string, enabled: boolean) => {
    await fetch('/api/admin/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, enabled: !enabled }),
    });
    setFlags((f) => f.map((ff) => ff.name === name ? { ...ff, enabled: !ff.enabled } : ff));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
        {flags.map((flag) => (
          <div key={flag.id} className="flex items-center justify-between py-2 border-b border-[#1e2a45] last:border-0">
            <div>
              <div className="text-white font-mono text-sm">{flag.name}</div>
              <div className="text-gray-500 text-xs">{flag.description}</div>
            </div>
            <button onClick={() => toggle(flag.name, flag.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-purple-600' : 'bg-[#1e2a45] border border-[#2a3a55]'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
