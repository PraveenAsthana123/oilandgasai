'use client';
import { useEffect, useState } from 'react';

interface Standard {
  id: number;
  standard_name: string;
  standard_code: string;
  category: string;
  version: string;
  effective_date: string;
  description: string;
}

export default function StandardsPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/standards').then(r => r.json()).then(d => { setStandards(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const catColor: Record<string, string> = {
    International: 'bg-blue-500/20 text-blue-400',
    Industry: 'bg-purple-500/20 text-purple-400',
    Canadian: 'bg-red-500/20 text-red-400',
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Standards &amp; Procedures Library</h1>
        <p className="text-gray-400 text-sm mt-1">ISO 55001, API RP 574, Z662 pipeline, API 653 tanks — version control &amp; acknowledgment tracking</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {standards.map(s => (
          <div key={s.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <code className="text-red-400 font-mono font-bold text-lg">{s.standard_code}</code>
              <span className={`text-xs px-2 py-0.5 rounded ${catColor[s.category] ?? 'bg-gray-500/20 text-gray-400'}`}>{s.category}</span>
            </div>
            <div className="text-white font-medium mb-1">{s.standard_name}</div>
            <div className="text-gray-400 text-sm">Version: {s.version}</div>
            <div className="text-gray-500 text-xs mt-1">Effective: {s.effective_date ? new Date(s.effective_date).toLocaleDateString() : '—'}</div>
          </div>
        ))}
      </div>
      {standards.length === 0 && <div className="text-center py-12 text-gray-500">No standards — initialize DB first</div>}
    </div>
  );
}
