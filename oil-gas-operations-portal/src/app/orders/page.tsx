'use client';
import { useEffect, useState } from 'react';

interface Order {
  id: number;
  po_number: string;
  item: string;
  vendor: string;
  amount_k: string;
  status: string;
  expected_delivery: string | null;
  created_at: string;
}

interface Kpis {
  total: string;
  open: string;
  in_transit: string;
  completed: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'text-blue-400 bg-blue-400/10',
  in_transit: 'text-amber-400 bg-amber-400/10',
  completed: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function OrdersPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ item: '', vendor: '', amount_k: '', expected_delivery: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      setRows(json.data ?? []);
      setKpis(json.kpis ?? null);
      setIsMock(!!json._mock);
    } catch {
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ item: '', vendor: '', amount_k: '', expected_delivery: '' });
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const kv = (v: string | undefined) => (v ? v : '—');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">📦 Purchase Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">Procurement of O&amp;G equipment, materials, and services.</p>
          {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total POs', value: kv(kpis?.total), color: 'text-amber-400' },
            { label: 'Open', value: kv(kpis?.open), color: 'text-blue-400' },
            { label: 'In Transit', value: kv(kpis?.in_transit), color: 'text-yellow-400' },
            { label: 'Completed', value: kv(kpis?.completed), color: 'text-green-400' },
          ].map((k) => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{k.label}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{loading ? '…' : k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e2a45] flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-200">Purchase Orders</span>
              <span className="text-xs text-gray-500">{rows.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500">
                    <th className="text-left px-4 py-2">PO Number</th>
                    <th className="text-left px-4 py-2">Item</th>
                    <th className="text-left px-4 py-2">Vendor</th>
                    <th className="text-right px-4 py-2">Amount ($K)</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Expected Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No orders yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                      <td className="px-4 py-2 font-mono text-amber-400/80">{r.po_number}</td>
                      <td className="px-4 py-2 text-gray-200 max-w-[160px] truncate" title={r.item}>{r.item}</td>
                      <td className="px-4 py-2 text-gray-400">{r.vendor}</td>
                      <td className="px-4 py-2 text-right text-gray-300">{r.amount_k ? `$${parseFloat(r.amount_k).toFixed(0)}K` : '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{r.expected_delivery ? new Date(r.expected_delivery).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-200 mb-4">Create Purchase Order</div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Item Description</label>
                <input value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))}
                  placeholder="Drill bits — 8.5 inch PDC" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Vendor</label>
                <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                  placeholder="Baker Hughes Supply" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Amount ($K)</label>
                <input type="number" value={form.amount_k} onChange={e => setForm(f => ({ ...f, amount_k: e.target.value }))}
                  placeholder="85" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Expected Delivery</label>
                <input type="date" value={form.expected_delivery} onChange={e => setForm(f => ({ ...f, expected_delivery: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-2 rounded text-xs transition-colors">
                {submitting ? 'Saving…' : 'Create PO'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
