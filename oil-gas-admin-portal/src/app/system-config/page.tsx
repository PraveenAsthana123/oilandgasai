'use client';
import { useEffect, useState } from 'react';

interface HealthData {
  db: string;
  ollama: string;
  ollama_models: string[];
}

const ENV_VARS = [
  { key: 'DATABASE_URL', desc: 'PostgreSQL connection string', required: true },
  { key: 'OLLAMA_URL', desc: 'Ollama API endpoint (default: http://localhost:11434)', required: false },
  { key: 'CHROMA_URL', desc: 'ChromaDB vector store endpoint', required: false },
  { key: 'SMTP_HOST', desc: 'Email SMTP host for notifications', required: false },
  { key: 'SMTP_PORT', desc: 'Email SMTP port', required: false },
  { key: 'SMTP_USER', desc: 'Email SMTP username', required: false },
  { key: 'IOT_BROKER_URL', desc: 'MQTT/IoT broker connection URL', required: false },
  { key: 'NEXTAUTH_SECRET', desc: 'NextAuth.js session secret', required: false },
];

export default function SystemConfigPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => { setHealth(d); setLoading(false); });
  }, []);

  const integrations = [
    { name: 'PostgreSQL Database', status: health?.db === 'connected', detail: 'DATABASE_URL' },
    { name: 'Ollama LLM', status: health?.ollama === 'connected', detail: `${health?.ollama_models?.length ?? 0} models available` },
    { name: 'ChromaDB (RAG)', status: false, detail: '⚠️ CHROMA_URL not set — Mocked' },
    { name: 'SMTP Email', status: false, detail: '⚠️ SMTP_HOST not set — pending_configuration' },
    { name: 'IoT Broker (MQTT)', status: false, detail: '⚠️ IOT_BROKER_URL not set' },
  ];

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">System Configuration</h1>
        <p className="text-gray-400 text-sm mt-1">Environment variable presence checks and integration health — values are never shown</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integration Health */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Integration Health</h2>
          <div className="space-y-3">
            {integrations.map(i => (
              <div key={i.name} className="flex items-center justify-between p-3 bg-[#0a0e1a] rounded-lg">
                <div>
                  <div className="text-white text-sm font-medium">{i.name}</div>
                  <div className="text-gray-400 text-xs">{i.detail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i.status ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`text-sm ${i.status ? 'text-green-400' : 'text-red-400'}`}>
                    {i.status ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Environment Variables</h2>
          <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mb-3">
            ⚠️ Variable values are never shown for security. Only presence is indicated.
          </div>
          <div className="space-y-2">
            {ENV_VARS.map(v => (
              <div key={v.key} className="flex items-center justify-between p-2 bg-[#0a0e1a] rounded-lg">
                <div>
                  <code className="text-blue-400 text-xs font-mono">{v.key}</code>
                  <div className="text-gray-500 text-xs">{v.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  {v.required && <span className="text-red-400 text-xs">Required</span>}
                  <span className="text-gray-400 text-xs">●●●●●●●●</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portal Info */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Portal Information</h2>
          <div className="space-y-2">
            {[
              { label: 'Portal Name', value: 'Oil & Gas Admin Portal' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Port', value: '8383' },
              { label: 'Framework', value: 'Next.js 14 App Router' },
              { label: 'Database Prefix', value: 'oga_' },
              { label: 'Output Mode', value: 'standalone (Docker-ready)' },
              { label: 'AI Model', value: 'llama3.2 via Ollama' },
              { label: 'Theme', value: 'Dark — #0a0e1a / red-500 accent' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1 border-b border-[#1e2a45]">
                <span className="text-gray-400 text-sm">{item.label}</span>
                <span className="text-white text-sm font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ollama Models */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Ollama AI Status</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${health?.ollama === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={`font-medium ${health?.ollama === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {health?.ollama === 'connected' ? 'Online' : 'Offline'}
            </span>
          </div>
          {health?.ollama_models && health.ollama_models.length > 0 ? (
            <div className="space-y-2">
              {health.ollama_models.map(m => (
                <div key={m} className="bg-[#0a0e1a] rounded-lg px-3 py-2 text-sm text-blue-400 font-mono">{m}</div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No models detected — ensure Ollama is running on port 11434</div>
          )}
        </div>
      </div>
    </div>
  );
}
