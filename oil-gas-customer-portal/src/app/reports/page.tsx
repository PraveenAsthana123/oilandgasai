'use client';
import { useEffect, useState } from 'react';

interface ReportData {
  deliveries: Array<{ product: string; volume: number; unit: string; delivery_date: string; status: string }>;
  invoices: Array<{ total_cad: number; status: string; computed_status: string; created_at: string }>;
  requests: Array<{ status: string; priority: string; request_type: string }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/deliveries').then(r => r.json()),
      fetch('/api/invoices').then(r => r.json()),
      fetch('/api/service-requests').then(r => r.json()),
    ]).then(([d, i, r]) => {
      setData({ deliveries: d.deliveries || [], invoices: i.invoices || [], requests: r.requests || [] });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-400">Loading reports...</div>;

  const totalVolByProduct: Record<string, number> = {};
  data?.deliveries.forEach(d => {
    if (d.status === 'delivered') totalVolByProduct[d.product] = (totalVolByProduct[d.product] || 0) + Number(d.volume);
  });

  const invoiceByStatus = { paid: 0, outstanding: 0, overdue: 0 };
  data?.invoices.forEach(inv => {
    const s = inv.computed_status as keyof typeof invoiceByStatus;
    if (s in invoiceByStatus) invoiceByStatus[s] += Number(inv.total_cad);
  });

  const reqByType: Record<string, number> = {};
  data?.requests.forEach(r => { reqByType[r.request_type] = (reqByType[r.request_type] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Reports</h1>
        <p className="text-gray-400 mt-1">Delivery volumes, invoice summary, and service request history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Delivery Volume by Product</h3>
          {Object.entries(totalVolByProduct).map(([product, vol]) => (
            <div key={product} className="flex justify-between items-center py-2 border-b border-[#1e2a45]/50">
              <span className="text-gray-300 text-sm">{product}</span>
              <span className="text-blue-400 text-sm font-medium">{vol.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(totalVolByProduct).length === 0 && <div className="text-gray-500 text-sm">No delivered volume yet</div>}
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Invoice Summary (CAD)</h3>
          {Object.entries(invoiceByStatus).map(([status, total]) => (
            <div key={status} className="flex justify-between items-center py-2 border-b border-[#1e2a45]/50">
              <span className={`text-sm capitalize ${status === 'paid' ? 'text-green-400' : status === 'overdue' ? 'text-red-400' : 'text-amber-400'}`}>{status}</span>
              <span className="text-gray-200 text-sm font-medium">${total.toLocaleString('en-CA', { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Service Requests by Type</h3>
          {Object.entries(reqByType).map(([type, count]) => (
            <div key={type} className="flex justify-between items-center py-2 border-b border-[#1e2a45]/50">
              <span className="text-gray-300 text-sm">{type.replace(/_/g, ' ')}</span>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">{count}</span>
            </div>
          ))}
          {Object.keys(reqByType).length === 0 && <div className="text-gray-500 text-sm">No service requests yet</div>}
        </div>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Delivery History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-[#1e2a45]">
                <th className="pb-2 text-left">Product</th>
                <th className="pb-2 text-left">Volume</th>
                <th className="pb-2 text-left">Date</th>
                <th className="pb-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.deliveries.map(d => (
                <tr key={d.delivery_date + d.product} className="border-b border-[#1e2a45]/50">
                  <td className="py-2 text-gray-200">{d.product}</td>
                  <td className="py-2 text-gray-300">{Number(d.volume).toLocaleString()} {d.unit}</td>
                  <td className="py-2 text-gray-400">{new Date(d.delivery_date).toLocaleDateString('en-CA')}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${d.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
