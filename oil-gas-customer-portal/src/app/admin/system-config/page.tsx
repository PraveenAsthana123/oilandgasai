'use client';

export default function SystemConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <p className="text-gray-400 mt-1">Environment variables and system settings</p>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Active Configuration</h2>
        <div className="space-y-3">
          {[
            { key: 'Portal Name', value: 'Oil & Gas Customer Self-Service Portal' },
            { key: 'Port', value: '8385' },
            { key: 'DB Prefix', value: 'ogcu_' },
            { key: 'AI Model', value: 'llama3.2 (Ollama)' },
            { key: 'Framework', value: 'Next.js 14 App Router' },
            { key: 'Output Mode', value: 'standalone (Docker)' },
          ].map(c => (
            <div key={c.key} className="flex justify-between py-2 border-b border-[#1e2a45]/50">
              <span className="text-gray-400 text-sm">{c.key}</span>
              <span className="text-gray-200 text-sm font-mono">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
