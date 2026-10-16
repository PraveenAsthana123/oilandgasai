'use client';
import { useEffect, useState } from 'react';

interface Lead { id: number; name: string; company: string; email: string; source: string; score: number; status: string; created_at: string }

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch('/api/leads').then(r => r.json()).then(d => setLeads(d.leads || []));
  }, []);

  const statusColor: Record<string, string> = { new: 'bg-gray-500/20 text-gray-400', qualified: 'bg-blue-500/20 text-blue-400', opportunity: 'bg-green-500/20 text-green-400', lost: 'bg-red-500/20 text-red-400' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 mt-1">Prospective customer pipeline</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">+ Add Lead</button>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3">
                  <div className="text-gray-200">{l.name}</div>
                  <div className="text-gray-500 text-xs">{l.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-300">{l.company}</td>
                <td className="px-4 py-3 text-gray-400">{l.source}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#1e2a45] rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${l.score >= 70 ? 'bg-green-500' : l.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${l.score}%` }} />
                    </div>
                    <span className="text-gray-300 text-xs">{l.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${statusColor[l.status] || 'bg-gray-500/20 text-gray-400'}`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
