'use client';
import { useEffect, useState } from 'react';

export default function SystemConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/system-config').then((r) => r.json()).then((d) => setConfig(d.config || {}));
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">System Configuration</h1>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-3">
        {Object.entries(config).map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b border-[#1e2a45] last:border-0">
            <span className="text-gray-400 text-sm font-mono">{k}</span>
            <span className="text-white text-sm">{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
