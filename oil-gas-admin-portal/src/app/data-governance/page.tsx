'use client';
import { useEffect, useState } from 'react';

interface DataClass {
  id: number;
  asset_type: string;
  classification: string;
  data_owner: string;
  retention_days: number;
  pipeda_applicable: boolean;
}

const CLASS_COLORS: Record<string, string> = {
  restricted: 'bg-red-500/20 text-red-400 border-red-500/30',
  confidential: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  internal: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  public: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function DataGovernancePage() {
  const [data, setData] = useState<DataClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data-governance').then(r => r.json()).then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Data Governance</h1>
        <p className="text-gray-400 text-sm mt-1">Data classification: public/internal/confidential/restricted · Data owners · Retention policies · PIPEDA compliance</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {['restricted','confidential','internal','public'].map(cls => {
          const count = data.filter(d => d.classification === cls).length;
          return (
            <div key={cls} className={`bg-[#0f1629] border rounded-xl p-4 text-center ${CLASS_COLORS[cls]?.includes('red') ? 'border-red-500/30' : 'border-[#1e2a45]'}`}>
              <div className={`text-2xl font-bold ${CLASS_COLORS[cls]?.split(' ')[1] ?? 'text-gray-400'}`}>{count}</div>
              <div className="text-gray-400 text-xs mt-1 capitalize">{cls}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2a45]">
              {['Asset Type', 'Classification', 'Data Owner', 'Retention', 'PIPEDA'].map(h => (
                <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                <td className="px-4 py-3 text-white text-sm">{d.asset_type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded border capitalize ${CLASS_COLORS[d.classification] ?? 'bg-gray-500/20 text-gray-400'}`}>{d.classification}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{d.data_owner}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{Math.round(d.retention_days / 365)} years ({d.retention_days} days)</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${d.pipeda_applicable ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {d.pipeda_applicable ? 'Applicable' : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="text-center py-8 text-gray-500">No data classifications — initialize DB first</div>}
      </div>
    </div>
  );
}
