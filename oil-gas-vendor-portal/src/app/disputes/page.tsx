'use client';
import { useEffect, useState } from 'react';

interface Dispute { id: number; dispute_type: string; related_id: number; description: string; status: string; resolution: string; created_at: string; }

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dispute_type: 'invoice_dispute', related_id: '', description: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/disputes').then((r) => r.json()).then((d) => setDisputes(d.disputes || []));
  }, []);

  const submit = async () => {
    await fetch('/api/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setShowForm(false);
    fetch('/api/disputes').then((r) => r.json()).then((d) => setDisputes(d.disputes || []));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispute Management</h1>
          <p className="text-gray-400 text-sm mt-1">Raise and track invoice, quality, and PO change disputes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">+ New Dispute</button>
      </div>

      {saved && <div className="bg-green-900/20 border border-green-700 rounded p-3 text-green-300 text-sm">✓ Dispute submitted</div>}

      {showForm && (
        <div className="bg-[#0f1629] border border-purple-500 rounded-lg p-5 space-y-4">
          <h3 className="text-white font-semibold">Raise New Dispute</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs block mb-1">Dispute Type</label>
              <select value={form.dispute_type} onChange={(e) => setForm((p) => ({ ...p, dispute_type: e.target.value }))}
                className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm">
                <option value="invoice_dispute">Invoice Dispute</option>
                <option value="quality_dispute">Quality Dispute</option>
                <option value="po_change_dispute">PO Change Dispute</option>
                <option value="payment_delay">Payment Delay</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Related Record ID (Invoice/PO #)</label>
              <input type="text" value={form.related_id} onChange={(e) => setForm((p) => ({ ...p, related_id: e.target.value }))}
                className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Description / Evidence</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={submit} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded text-sm">Submit Dispute</button>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {disputes.length === 0 ? (
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-8 text-center text-gray-500">No disputes on record.</div>
        ) : disputes.map((d) => (
          <div key={d.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white font-medium text-sm capitalize">{d.dispute_type.replace('_', ' ')}</div>
                <div className="text-gray-400 text-xs mt-1">Related ID: {d.related_id} · Opened: {new Date(d.created_at).toLocaleDateString()}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${d.status === 'open' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-green-900/30 text-green-400 border-green-700'}`}>{d.status}</span>
            </div>
            <p className="text-gray-300 text-sm mt-2">{d.description}</p>
            {d.resolution && <div className="mt-2 bg-green-900/10 border border-green-800 rounded p-2 text-green-300 text-xs">Resolution: {d.resolution}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
