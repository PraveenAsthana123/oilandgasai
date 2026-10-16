'use client';
import { useEffect, useState } from 'react';

interface Invoice {
  id: number;
  company: string;
  product: string;
  volume: number;
  unit: string;
  amount_cad: number;
  hst_cad: number;
  total_cad: number;
  due_date: string;
  status: string;
  computed_status: string;
  paid_at: string | null;
  days_overdue: number;
  created_at: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/invoices').then(r => r.json()).then(d => {
      setInvoices(d.invoices || []);
      setLoading(false);
    });
  }, []);

  async function payInvoice(id: number) {
    setPaying(id);
    const r = await fetch(`/api/invoices/${id}/pay`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'bank_transfer' }) });
    const data = await r.json();
    setMsg(data.message || 'Payment recorded');
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, computed_status: 'paid', status: 'paid' } : i));
    setPaying(null);
  }

  if (loading) return <div className="text-blue-400">Loading invoices...</div>;

  const totalOutstanding = invoices.filter(i => i.computed_status !== 'paid').reduce((s, i) => s + Number(i.total_cad), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices & Billing</h1>
          <p className="text-gray-400 mt-1">Invoice history, payment status, and billing details</p>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl px-4 py-3 text-right">
          <div className="text-gray-500 text-xs">Total Outstanding</div>
          <div className="text-white text-xl font-bold">${totalOutstanding.toLocaleString('en-CA', { maximumFractionDigits: 0 })} CAD</div>
        </div>
      </div>

      {msg && <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-3 text-green-400 text-sm">{msg}</div>}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Invoice</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">HST 13%</th>
              <th className="px-4 py-3 text-right">Total CAD</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3 text-blue-400 font-mono">INV-{String(inv.id).padStart(4, '0')}</td>
                <td className="px-4 py-3 text-gray-200">{inv.company}</td>
                <td className="px-4 py-3 text-gray-400">{inv.product || '—'}</td>
                <td className="px-4 py-3 text-right text-gray-300">${Number(inv.amount_cad).toLocaleString('en-CA', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right text-gray-400">${Number(inv.hst_cad).toLocaleString('en-CA', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-right text-white font-semibold">${Number(inv.total_cad).toLocaleString('en-CA', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(inv.due_date).toLocaleDateString('en-CA')}</td>
                <td className="px-4 py-3">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      inv.computed_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      inv.computed_status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>{inv.computed_status}</span>
                    {inv.computed_status === 'overdue' && inv.days_overdue > 0 && (
                      <div className="text-red-400 text-xs mt-0.5">{inv.days_overdue}d past due</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-blue-400 text-xs hover:underline">📄 PDF</button>
                    {inv.computed_status !== 'paid' && (
                      <button
                        onClick={() => payInvoice(inv.id)}
                        disabled={paying === inv.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded disabled:opacity-50">
                        {paying === inv.id ? '...' : 'Pay Now'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
