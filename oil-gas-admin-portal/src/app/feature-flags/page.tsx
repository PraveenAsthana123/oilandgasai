'use client';
import { useEffect, useState } from 'react';

interface Flag {
  id: number;
  feature_name: string;
  enabled: boolean;
  description: string;
  updated_at: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    // Load all flags by fetching known ones
    const KNOWN = ['upstream','midstream','downstream','ai_models','digital_twin','rag','regulatory','safety'];
    Promise.all(KNOWN.map(n => fetch(`/api/feature-flags/${n}`).then(r => r.json()).catch(() => null)))
      .then(results => {
        setFlags(results.filter(Boolean));
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const toggle = async (name: string, current: boolean) => {
    const res = await fetch(`/api/feature-flags/${name}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !current }),
    });
    const data = await res.json();
    if (data.feature_name) { setMsg(`${name}: ${!current ? 'enabled' : 'disabled'}`); load(); }
    else setMsg(data.error ?? 'Error');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Feature Toggle Panel</h1>
        <p className="text-gray-400 text-sm mt-1">Enable/disable modules — toggling OFF hides nav and blocks API route</p>
      </div>
      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flags.map(f => (
          <div key={f.id} className={`bg-[#0f1629] border rounded-xl p-5 flex items-center justify-between ${f.enabled ? 'border-[#1e2a45]' : 'border-red-500/30 opacity-70'}`}>
            <div>
              <div className="text-white font-medium capitalize">{f.feature_name.replace(/_/g, ' ')}</div>
              <div className="text-gray-400 text-sm mt-1">{f.description}</div>
              <div className="text-gray-500 text-xs mt-1">Updated: {new Date(f.updated_at).toLocaleString()}</div>
            </div>
            <button
              onClick={() => toggle(f.feature_name, f.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${f.enabled ? 'bg-red-500' : 'bg-[#1e2a45]'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>
      {flags.length === 0 && <div className="text-center py-12 text-gray-500">No feature flags — initialize DB first</div>}
    </div>
  );
}
