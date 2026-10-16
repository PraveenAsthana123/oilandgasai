'use client';
import { useEffect, useState } from 'react';

interface PO { id: number; vendor_name: string; po_number: string; title: string; amount_cad: number; delivery_date: string; status: string; on_time: boolean | null; quality_accepted: boolean | null; created_at: string; }

const statusColors: Record<string, string> = {
  issued: 'bg-purple-900/30 text-purple-400 border-purple-700',
  'in-progress': 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
  shipped: 'bg-blue-900/30 text-blue-400 border-blue-700',
  complete: 'bg-green-900/30 text-green-400 border-green-700',
  dispute: 'bg-red-900/30 text-red-400 border-red-700',
};

export default function PurchaseOrdersPage() {
  const [pos, setPOs] = useState<PO[]>([]);

  useEffect(() => {
    fetch('/api/purchase-orders').then((r) => r.json()).then((d) => setPOs(d.purchase_orders || []));
  }, []);

  const totalActive = pos.filter((p) => ['issued', 'in-progress'].includes(p.status)).reduce((s, p) => s + parseFloat(String(p.amount_cad || 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Purchase Orders</h1>
        <p className="text-gray-400 text-sm mt-1">POs issued to your company — track delivery and payment triggers</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total POs', value: pos.length },
          { label: 'Active Value CAD', value: `$${(totalActive / 1000).toFixed(0)}K` },
          { label: 'In Progress', value: pos.filter((p) => p.status === 'in-progress').length },
          { label: 'Complete', value: pos.filter((p) => p.status === 'complete').length },
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
              {['PO Number', 'Title', 'Value CAD', 'Delivery Date', 'On Time', 'Quality', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pos.map((po) => (
              <tr key={po.id} className="border-t border-[#1e2a45] hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3 text-purple-400 font-mono text-xs">{po.po_number}</td>
                <td className="px-4 py-3 text-gray-300 max-w-[200px]"><div className="truncate">{po.title}</div></td>
                <td className="px-4 py-3 text-white font-medium">${Number(po.amount_cad).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{po.delivery_date}</td>
                <td className="px-4 py-3">{po.on_time === null ? '—' : po.on_time ? <span className="text-green-400">✓ Yes</span> : <span className="text-red-400">✗ No</span>}</td>
                <td className="px-4 py-3">{po.quality_accepted === null ? '—' : po.quality_accepted ? <span className="text-green-400">✓ Accepted</span> : <span className="text-red-400">✗ Rejected</span>}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColors[po.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {po.status}
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
