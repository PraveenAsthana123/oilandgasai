'use client';
import { useState } from 'react';

const DEMO_DOCS = [
  { id: 1, name: 'MSA Agreement 2024 - Suncor', doc_type: 'contract', size: '2.4 MB', date: '2024-01-15' },
  { id: 2, name: 'Supply Agreement - Natural Gas', doc_type: 'contract', size: '1.8 MB', date: '2024-06-01' },
  { id: 3, name: 'Quality Certificate Q3-2024', doc_type: 'certificate', size: '0.5 MB', date: '2024-09-30' },
  { id: 4, name: 'WHMIS Compliance Report 2024', doc_type: 'compliance', size: '3.1 MB', date: '2024-10-01' },
  { id: 5, name: 'Pipeline Inspection Report Sep-2024', doc_type: 'technical', size: '5.2 MB', date: '2024-09-15' },
  { id: 6, name: 'Environmental Impact Assessment', doc_type: 'compliance', size: '8.7 MB', date: '2024-07-20' },
];

const TYPE_COLORS: Record<string, string> = {
  contract: 'bg-blue-500/20 text-blue-400',
  certificate: 'bg-green-500/20 text-green-400',
  compliance: 'bg-amber-500/20 text-amber-400',
  technical: 'bg-purple-500/20 text-purple-400',
};

export default function DocumentsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = DEMO_DOCS.filter(d =>
    (filter === 'all' || d.doc_type === filter) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Documents</h1>
        <p className="text-gray-400 mt-1">Contracts, certificates, compliance docs, and technical reports</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'contract', 'certificate', 'compliance', 'technical'].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === t ? 'bg-blue-600 text-white' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="ml-auto bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500" />
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Document</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📄</span>
                    <span className="text-gray-200">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${TYPE_COLORS[d.doc_type] || ''}`}>{d.doc_type}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{d.date}</td>
                <td className="px-4 py-3 text-gray-500">{d.size}</td>
                <td className="px-4 py-3">
                  <button className="text-blue-400 text-xs hover:underline mr-3">Download</button>
                  <button className="text-gray-500 text-xs hover:text-gray-300">Preview</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
