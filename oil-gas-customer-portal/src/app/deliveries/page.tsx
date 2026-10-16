'use client';
import { useEffect, useState } from 'react';

interface Delivery {
  id: number;
  company: string;
  product: string;
  volume: number;
  unit: string;
  delivery_date: string;
  status: string;
  spec_status: string;
  api_gravity: number;
  sulphur_pct: number;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  scheduled: { color: 'bg-blue-500/20 text-blue-400', label: 'Scheduled' },
  in_transit: { color: 'bg-amber-500/20 text-amber-400', label: 'In Transit' },
  delivered: { color: 'bg-green-500/20 text-green-400', label: 'Delivered' },
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/deliveries').then(r => r.json()).then(d => {
      setDeliveries(d.deliveries || []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter);

  if (loading) return <div className="text-blue-400">Loading deliveries...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Delivery Tracking</h1>
        <p className="text-gray-400 mt-1">Crude oil, gas, and refined product deliveries</p>
      </div>

      <div className="flex gap-2">
        {['all', 'scheduled', 'in_transit', 'delivered'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-blue-600 text-white' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-gray-200'}`}>
            {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Delivery ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Volume</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Quality</th>
              <th className="px-4 py-3 text-left">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => {
              const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG['scheduled'];
              return (
                <tr key={d.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                  <td className="px-4 py-3 text-blue-400 font-mono">DEL-{String(d.id).padStart(4, '0')}</td>
                  <td className="px-4 py-3 text-gray-200">{d.company}</td>
                  <td className="px-4 py-3 text-gray-200">{d.product}</td>
                  <td className="px-4 py-3 text-gray-300">{Number(d.volume).toLocaleString()} {d.unit}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(d.delivery_date).toLocaleDateString('en-CA')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {d.spec_status ? (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        d.spec_status === 'within_spec' ? 'bg-green-500/20 text-green-400' :
                        d.spec_status === 'marginal' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>{d.spec_status.replace('_', ' ')}</span>
                    ) : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {d.status === 'delivered' ? (
                      <button className="text-blue-400 text-xs hover:underline">📄 Download</button>
                    ) : <span className="text-gray-600 text-xs">Pending</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
