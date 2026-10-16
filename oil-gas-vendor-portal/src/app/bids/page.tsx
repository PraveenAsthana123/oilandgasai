'use client';
import { useEffect, useState } from 'react';

interface Bid { id: number; rfq_number: string; rfq_title: string; amount_cad: number; hst_cad: number; status: string; delivery_days: number; validity_days: number; created_at: string; }

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
  'under review': 'bg-blue-900/30 text-blue-400 border-blue-700',
  awarded: 'bg-green-900/30 text-green-400 border-green-700',
  declined: 'bg-red-900/30 text-red-400 border-red-700',
};

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    fetch('/api/bids').then((r) => r.json()).then((d) => setBids(d.bids || []));
  }, []);

  const total = bids.reduce((s, b) => s + parseFloat(String(b.amount_cad || 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Bids</h1>
        <p className="text-gray-400 text-sm mt-1">Track all submitted bids and their outcomes</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Bids', value: bids.length },
          { label: 'Total Value CAD', value: `$${(total / 1000).toFixed(0)}K` },
          { label: 'Awarded', value: bids.filter((b) => b.status === 'awarded').length },
          { label: 'Pending', value: bids.filter((b) => b.status === 'submitted').length },
        ].map((k) => (
          <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]">
            <tr>
              {['RFQ #', 'Title', 'Bid Amount CAD', 'HST', 'Delivery Days', 'Validity', 'Submitted', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bids.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-500">No bids submitted yet. Browse <a href="/rfq" className="text-purple-400">open RFQs</a>.</td></tr>
            ) : bids.map((b) => (
              <tr key={b.id} className="border-t border-[#1e2a45] hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3 text-purple-400">{b.rfq_number}</td>
                <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{b.rfq_title}</td>
                <td className="px-4 py-3 text-white font-medium">${Number(b.amount_cad).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">${Number(b.hst_cad).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-300">{b.delivery_days} days</td>
                <td className="px-4 py-3 text-gray-300">{b.validity_days} days</td>
                <td className="px-4 py-3 text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[b.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
