'use client';
import { useEffect, useState } from 'react';

interface Invoice { id: number; po_number: string; invoice_number: string; amount_cad: number; hst_cad: number; total_cad: number; status: string; disputed: boolean; created_at: string; }
interface PO { id: number; po_number: string; title: string; }

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
  approved: 'bg-blue-900/30 text-blue-400 border-blue-700',
  paid: 'bg-green-900/30 text-green-400 border-green-700',
  disputed: 'bg-red-900/30 text-red-400 border-red-700',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ po_id: '', invoice_number: '', amount_cad: '', hst_cad: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/invoices').then((r) => r.json()).then((d) => setInvoices(d.invoices || []));
    fetch('/api/purchase-orders').then((r) => r.json()).then((d) => setPOs(d.purchase_orders || []));
  }, []);

  const submit = async () => {
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setShowForm(false);
    fetch('/api/invoices').then((r) => r.json()).then((d) => setInvoices(d.invoices || []));
  };

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + parseFloat(String(i.total_cad || 0)), 0);
  const totalPending = invoices.filter((i) => i.status === 'submitted').reduce((s, i) => s + parseFloat(String(i.total_cad || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoice Management</h1>
          <p className="text-gray-400 text-sm mt-1">Submit and track invoices against purchase orders</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
          + New Invoice
        </button>
      </div>

      {saved && <div className="bg-green-900/20 border border-green-700 rounded p-3 text-green-300 text-sm">✓ Invoice submitted</div>}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoices.length },
          { label: 'Total Paid CAD', value: `$${(totalPaid / 1000).toFixed(0)}K` },
          { label: 'Pending Payment CAD', value: `$${(totalPending / 1000).toFixed(0)}K` },
          { label: 'Disputed', value: invoices.filter((i) => i.disputed).length },
        ].map((k) => (
          <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-[#0f1629] border border-purple-500 rounded-lg p-5 space-y-4">
          <h3 className="text-white font-semibold">Submit New Invoice</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Purchase Order</label>
              <select value={form.po_id} onChange={(e) => setForm((p) => ({ ...p, po_id: e.target.value }))}
                className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm">
                <option value="">Select PO...</option>
                {pos.map((po) => <option key={po.id} value={po.id}>{po.po_number}</option>)}
              </select>
            </div>
            {[['Invoice Number', 'invoice_number'], ['Amount CAD (excl. HST)', 'amount_cad'], ['HST CAD', 'hst_cad']].map(([label, key]) => (
              <div key={key}>
                <label className="text-gray-400 text-xs block mb-1">{label}</label>
                <input type="text" value={(form as Record<string, string>)[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={submit} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded text-sm">Submit Invoice</button>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1e2a45]">
            <tr>
              {['Invoice #', 'PO #', 'Amount CAD', 'HST', 'Total CAD', 'Disputed', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-400 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-[#1e2a45] hover:bg-[#1e2a45]/30">
                <td className="px-4 py-3 text-purple-400">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-gray-400">{inv.po_number}</td>
                <td className="px-4 py-3 text-white">${Number(inv.amount_cad).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">${Number(inv.hst_cad).toLocaleString()}</td>
                <td className="px-4 py-3 text-white font-medium">${Number(inv.total_cad).toLocaleString()}</td>
                <td className="px-4 py-3">{inv.disputed ? <span className="text-red-400">⚠ Yes</span> : <span className="text-gray-500">—</span>}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[inv.status] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {inv.status}
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
