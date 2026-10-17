'use client';
import { useEffect, useState } from 'react';

interface Quotation {
  id: number;
  quote_num: string;
  vendor: string;
  service_type: string;
  amount_k: string;
  status: string;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
}

interface Kpis {
  total: string;
  pending_review: string;
  accepted: string;
  total_value: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  accepted: 'text-green-400 bg-green-400/10',
  rejected: 'text-red-400 bg-red-400/10',
  expired: 'text-gray-500 bg-gray-500/10',
};

export default function QuotationsPage() {
  const [rows, setRows] = useState<Quotation[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ vendor: '', service_type: 'Drilling Services', amount_k: '', notes: '', expiry_date: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotations');
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
      await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ vendor: '', service_type: 'Drilling Services', amount_k: '', notes: '', expiry_date: '' });
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
          <h1 className="text-2xl font-bold text-amber-400">💬 Service Quotations</h1>
          <p className="text-gray-500 mt-1 text-sm">Drilling services, equipment rental, and contractor quotes for O&amp;G operations.</p>
          {isMock && <div className="mt-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 inline-block">⚠️ Mocked — DATABASE_URL not configured or DB unavailable</div>}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Quotes', value: kv(kpis?.total), color: 'text-amber-400' },
            { label: 'Pending Review', value: kv(kpis?.pending_review), color: 'text-yellow-400' },
            { label: 'Accepted', value: kv(kpis?.accepted), color: 'text-green-400' },
            { label: 'Total Value ($M)', value: kpis?.total_value ? `$${parseFloat(kpis.total_value).toFixed(1)}M` : '—', color: 'text-blue-400' },
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
              <span className="text-sm font-semibold text-gray-200">All Quotations</span>
              <span className="text-xs text-gray-500">{rows.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500">
                    <th className="text-left px-4 py-2">Quote #</th>
                    <th className="text-left px-4 py-2">Vendor</th>
                    <th className="text-left px-4 py-2">Service Type</th>
                    <th className="text-right px-4 py-2">Amount ($K)</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No quotations yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                      <td className="px-4 py-2 font-mono text-amber-400/80">{r.quote_num}</td>
                      <td className="px-4 py-2 text-gray-200">{r.vendor}</td>
                      <td className="px-4 py-2 text-gray-400">{r.service_type}</td>
                      <td className="px-4 py-2 text-right text-gray-300">{r.amount_k ? `$${parseFloat(r.amount_k).toFixed(0)}K` : '—'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[r.status] ?? 'text-gray-400 bg-gray-400/10'}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-200 mb-4">Create Quotation</div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Vendor</label>
                <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                  placeholder="Halliburton Services Ltd." className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Service Type</label>
                <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50">
                  <option>Drilling Services</option>
                  <option>Equipment Rental</option>
                  <option>Wellbore Completion</option>
                  <option>Pipeline Inspection</option>
                  <option>Maintenance Contract</option>
                  <option>Logistics</option>
                  <option>Engineering Consultancy</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Amount ($K)</label>
                <input type="number" value={form.amount_k} onChange={e => setForm(f => ({ ...f, amount_k: e.target.value }))}
                  placeholder="450" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Additional scope details…" className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold py-2 rounded text-xs transition-colors">
                {submitting ? 'Saving…' : 'Create Quotation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
