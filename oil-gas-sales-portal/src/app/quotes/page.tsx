'use client';
import { useEffect, useState } from 'react';

const PRODUCTS = [
  { name: 'Crude Oil', unit: 'bbl', price: 95.50 },
  { name: 'Natural Gas', unit: 'GJ', price: 3.20 },
  { name: 'NGL Mix', unit: 'bbl', price: 48.75 },
  { name: 'LNG', unit: 'MMBTU', price: 12.80 },
  { name: 'AI Monitoring SaaS', unit: 'asset/month', price: 15000 },
  { name: 'Implementation Services', unit: 'project', price: 500000 },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lineItems, setLineItems] = useState([{ product: 'Crude Oil', unit: 'bbl', qty: 1000, price: 95.50 }]);
  const [oppId, setOppId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetch('/api/quotes').then(r => r.json()).then(d => { setQuotes(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const totalAmount = lineItems.reduce((s, li) => s + li.qty * li.price, 0);

  const addItem = () => setLineItems([...lineItems, { product: 'Natural Gas', unit: 'GJ', qty: 100, price: 3.20 }]);
  const removeItem = (i: number) => setLineItems(lineItems.filter((_, idx) => idx !== i));

  const submit = async () => {
    await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ opportunity_id: oppId || null, amount_cad: totalAmount, line_items: lineItems, expires_at: expiresAt || null }) });
    setShowForm(false);
    fetch('/api/quotes').then(r => r.json()).then(d => setQuotes(Array.isArray(d) ? d : []));
  };

  const statusColor: Record<string, string> = { draft: 'bg-slate-700 text-slate-300', sent: 'bg-blue-800 text-blue-300', viewed: 'bg-yellow-800 text-yellow-300', accepted: 'bg-emerald-800 text-emerald-300', expired: 'bg-red-900 text-red-300' };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quote Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create and track quotes with commodity line items</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Quote
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-4">
          <h2 className="text-sm font-semibold text-white">Create Quote</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Opportunity ID (optional)</label>
              <input value={oppId} onChange={e => setOppId(e.target.value)} placeholder="e.g. 3" className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Expires At</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 font-semibold">Line Items</label>
              <button onClick={addItem} className="text-xs text-emerald-400 hover:text-emerald-300">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {lineItems.map((li, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <select value={li.product} onChange={e => {
                    const p = PRODUCTS.find(p => p.name === e.target.value);
                    setLineItems(items => items.map((item, idx) => idx === i ? { ...item, product: e.target.value, unit: p?.unit || item.unit, price: p?.price || item.price } : item));
                  }} className="col-span-2 bg-[#0a0e1a] border border-[#1e2a45] text-white text-xs rounded px-2 py-1.5">
                    {PRODUCTS.map(p => <option key={p.name}>{p.name}</option>)}
                  </select>
                  <input type="number" value={li.qty} onChange={e => setLineItems(items => items.map((item, idx) => idx === i ? { ...item, qty: parseFloat(e.target.value) } : item))} className="bg-[#0a0e1a] border border-[#1e2a45] text-white text-xs rounded px-2 py-1.5" placeholder="Qty" />
                  <input type="number" step="0.01" value={li.price} onChange={e => setLineItems(items => items.map((item, idx) => idx === i ? { ...item, price: parseFloat(e.target.value) } : item))} className="bg-[#0a0e1a] border border-[#1e2a45] text-white text-xs rounded px-2 py-1.5" placeholder="Price" />
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 text-xs">${(li.qty * li.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-xs ml-1">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1e2a45]">
            <div className="text-white font-bold">Total: <span className="text-emerald-400">${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} CAD</span></div>
            <div className="flex gap-2">
              <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm">Save Quote</button>
              <button onClick={() => setShowForm(false)} className="border border-[#1e2a45] text-slate-300 px-4 py-1.5 rounded text-sm hover:bg-[#1e2a45]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Commodity Reference Prices */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Commodity Reference Prices (CAD)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRODUCTS.map(p => (
            <div key={p.name} className="bg-[#0a0e1a] rounded p-2 text-center">
              <div className="text-xs text-slate-400">{p.name}</div>
              <div className="text-emerald-400 font-bold">${p.price.toFixed(2)}</div>
              <div className="text-xs text-slate-500">/{p.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      {loading ? <div className="text-slate-400 text-sm">Loading quotes...</div> : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-[#1e2a45] bg-[#0a0e1a]">
                <th className="text-left px-4 py-3">Quote #</th>
                <th className="text-left px-4 py-3">Opportunity</th>
                <th className="text-left px-4 py-3">Amount (CAD)</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Line Items</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-[#1e2a45]/40 hover:bg-[#1e2a45]/20">
                  <td className="px-4 py-3 text-white font-medium">Q-{q.id.toString().padStart(4, '0')}</td>
                  <td className="px-4 py-3 text-slate-400">{q.opportunity_id || '—'}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">${parseFloat(q.amount_cad || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[q.status] || 'bg-slate-700 text-slate-300'}`}>{q.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{Array.isArray(q.line_items) ? q.line_items.length : '—'} items</td>
                  <td className="px-4 py-3 text-slate-400">{q.expires_at ? new Date(q.expires_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(q.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {quotes.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-500">No quotes yet. Create one above.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
