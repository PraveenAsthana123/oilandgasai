'use client';

import { useEffect, useState } from 'react';

interface Payment {
  id: number;
  payment_number: string;
  payee: string;
  type: string;
  amount_k: number;
  due_date: string;
  dept: string;
  status: string;
  reference: string;
  created_at: string;
}

interface PaymentKpis {
  total_k: number;
  pending_count: number;
  overdue_count: number;
  paid_count: number;
}

const STATUS_FILTERS = ['all', 'pending', 'paid', 'overdue', 'cancelled'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-500/30',
  paid: 'text-green-400 bg-green-400/10 border-green-500/30',
  overdue: 'text-red-400 bg-red-400/10 border-red-500/30',
  cancelled: 'text-gray-400 bg-gray-400/10 border-gray-500/30',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [kpis, setKpis] = useState<PaymentKpis>({ total_k: 0, pending_count: 0, overdue_count: 0, paid_count: 0 });
  const [mock, setMock] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState({
    payee: '',
    type: 'Vendor Invoice',
    amount_k: '',
    due_date: new Date().toISOString().split('T')[0],
    dept: '',
    reference: '',
  });

  async function load() {
    try {
      const r = await fetch('/api/payments');
      const d = await r.json();
      if (d._mock || !Array.isArray(d.payments)) {
        setMock(true);
        setPayments([]);
        setKpis({ total_k: 0, pending_count: 0, overdue_count: 0, paid_count: 0 });
      } else {
        setPayments(d.payments);
        setKpis(d.kpis || computeKpis(d.payments));
      }
    } catch {
      setMock(true);
      setPayments([]);
      setKpis({ total_k: 0, pending_count: 0, overdue_count: 0, paid_count: 0 });
    }
  }

  function computeKpis(rows: Payment[]): PaymentKpis {
    return {
      total_k: rows.reduce((s, p) => s + (p.amount_k || 0), 0),
      pending_count: rows.filter(p => p.status === 'pending').length,
      overdue_count: rows.filter(p => p.status === 'overdue').length,
      paid_count: rows.filter(p => p.status === 'paid').length,
    };
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.payee || !form.amount_k) return;
    setSaving(true);
    try {
      const r = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount_k: parseFloat(form.amount_k) }),
      });
      const d = await r.json();
      if (d.payment) {
        setPayments(prev => [d.payment, ...prev]);
        setKpis(computeKpis([d.payment, ...payments]));
        setShowForm(false);
        setForm({ payee: '', type: 'Vendor Invoice', amount_k: '', due_date: new Date().toISOString().split('T')[0], dept: '', reference: '' });
      } else {
        await load();
      }
    } catch {
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(payment: Payment) {
    setMarkingPaid(p => ({ ...p, [payment.id]: true }));
    try {
      await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      });
      setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'paid' } : p));
      setKpis(prev => ({
        ...prev,
        pending_count: Math.max(0, prev.pending_count - 1),
        paid_count: prev.paid_count + 1,
      }));
    } catch {
      await load();
    } finally {
      setMarkingPaid(p => ({ ...p, [payment.id]: false }));
    }
  }

  const filtered = statusFilter === 'all'
    ? payments
    : payments.filter(p => p.status === statusFilter);

  return (
    <main className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">💳</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Payment Management</h1>
              <p className="text-gray-500 text-sm">Vendor invoices, regulatory fees, service contracts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mock && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                ⚠️ Mocked — set DATABASE_URL to enable payments
              </span>
            )}
            <button
              onClick={() => setShowForm(v => !v)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors"
            >
              + New Payment
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total ($k)', value: `$${kpis.total_k.toFixed(1)}k`, icon: '💰', color: 'text-amber-400' },
            { label: 'Pending', value: kpis.pending_count, icon: '⏳', color: 'text-amber-400' },
            { label: 'Overdue', value: kpis.overdue_count, icon: '🚨', color: 'text-red-400' },
            { label: 'Paid', value: kpis.paid_count, icon: '✅', color: 'text-green-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-gray-500 text-xs">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
            <h2 className="text-gray-100 font-semibold mb-4">New Payment</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Payee *</label>
                <input
                  required
                  value={form.payee}
                  onChange={e => setForm(f => ({ ...f, payee: e.target.value }))}
                  placeholder="Vendor or contractor name"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
                >
                  {['Vendor Invoice', 'Regulatory Fee', 'Service Contract', 'Drilling Contract', 'Transport Fee', 'Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Amount ($k) *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.amount_k}
                  onChange={e => setForm(f => ({ ...f, amount_k: e.target.value }))}
                  placeholder="e.g. 125.5"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Due Date *</label>
                <input
                  required
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Department</label>
                <input
                  value={form.dept}
                  onChange={e => setForm(f => ({ ...f, dept: e.target.value }))}
                  placeholder="e.g. Drilling, Production"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Reference</label>
                <input
                  value={form.reference}
                  onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="PO number or invoice ref"
                  className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Create Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-[#1e2a45] text-gray-300 hover:text-white rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${
                statusFilter === s
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-[#0f1629] border-[#1e2a45] text-gray-400 hover:text-gray-200'
              }`}
            >
              {s === 'all' ? 'All Payments' : s}
            </button>
          ))}
          <span className="ml-auto text-gray-500 text-xs self-center">{filtered.length} records</span>
        </div>

        {/* Payments table */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
                  {['Payment #', 'Payee', 'Type', 'Amount ($k)', 'Due Date', 'Dept', 'Status', 'Reference', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      {mock
                        ? 'No data — database not connected. Create a payment above to test.'
                        : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}payments found.`}
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr
                    key={p.id}
                    className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-amber-400 font-mono text-xs font-medium">
                      {p.payment_number || `PMT-${String(p.id).padStart(4, '0')}`}
                    </td>
                    <td className="px-4 py-3 text-gray-200 font-medium text-xs max-w-[140px] truncate">
                      {p.payee}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{p.type}</td>
                    <td className="px-4 py-3 text-gray-200 text-xs font-semibold">
                      ${typeof p.amount_k === 'number' ? p.amount_k.toFixed(1) : p.amount_k}k
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {p.due_date ? new Date(p.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.dept || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-xs font-medium capitalize ${STATUS_COLORS[p.status] || 'text-gray-400 bg-gray-400/10 border-gray-500/30'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{p.reference || '—'}</td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => markPaid(p)}
                          disabled={markingPaid[p.id]}
                          className="text-xs text-green-400 hover:text-green-300 border border-green-500/30 px-2 py-1 rounded disabled:opacity-50 whitespace-nowrap transition-colors"
                        >
                          {markingPaid[p.id] ? '…' : '✓ Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
