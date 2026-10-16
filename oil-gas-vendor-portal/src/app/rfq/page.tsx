'use client';
import { useEffect, useState } from 'react';

interface RFQ { id: number; rfq_number: string; title: string; description: string; service_category: string; estimated_value_cad: number; due_date: string; status: string; }

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selected, setSelected] = useState<RFQ | null>(null);
  const [bid, setBid] = useState({ amount: '', hst: '', days: '30', validity: '30', notes: '' });
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/rfq').then((r) => r.json()).then((d) => setRfqs(d.rfqs || []));
  }, []);

  const generateAIDraft = async () => {
    if (!selected) return;
    setAiLoading(true);
    const res = await fetch('/api/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `Help me write a technical proposal for: ${selected.title}. Service category: ${selected.service_category}. Budget: $${selected.estimated_value_cad.toLocaleString()} CAD.` }),
    });
    const data = await res.json();
    setAiDraft(data.response || '');
    setAiLoading(false);
  };

  const submitBid = async () => {
    if (!selected) return;
    await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfq_id: selected.id, amount_cad: bid.amount, hst_cad: bid.hst || Number(bid.amount) * 0.13, delivery_days: bid.days, validity_days: bid.validity, notes: bid.notes }),
    });
    setSubmitted(true);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">RFQ / RFP Management</h1>
        <p className="text-gray-400 text-sm mt-1">Active RFQs you have been invited to bid on</p>
      </div>

      {submitted && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 text-green-300 text-sm">
          ✓ Bid submitted successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className={`bg-[#0f1629] border rounded-lg p-4 cursor-pointer transition-colors ${selected?.id === rfq.id ? 'border-purple-500' : 'border-[#1e2a45] hover:border-[#2a3a55]'}`}
            onClick={() => setSelected(rfq)}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-purple-400 text-xs font-mono">{rfq.rfq_number}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${rfq.status === 'open' ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-gray-800 text-gray-400'}`}>
                {rfq.status}
              </span>
            </div>
            <h3 className="text-white font-medium text-sm mb-1">{rfq.title}</h3>
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">{rfq.description}</p>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">{rfq.service_category}</span>
              <span className="text-white font-medium">${Number(rfq.estimated_value_cad).toLocaleString()} CAD</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Due: {rfq.due_date}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="bg-[#0f1629] border border-purple-500 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Submit Bid — {selected.rfq_number}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[['Total Amount (CAD)', 'amount', 'number'], ['HST (CAD)', 'hst', 'number'], ['Delivery (days)', 'days', 'number'], ['Validity (days)', 'validity', 'number']].map(([label, key, type]) => (
              <div key={key}>
                <label className="text-gray-400 text-xs block mb-1">{label}</label>
                <input type={type} value={(bid as Record<string, string>)[key]} onChange={(e) => setBid((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Technical Notes / Proposal</label>
            <textarea rows={4} value={bid.notes || aiDraft} onChange={(e) => setBid((p) => ({ ...p, notes: e.target.value }))}
              className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={generateAIDraft} disabled={aiLoading}
              className="bg-[#1e2a45] hover:bg-purple-900/30 border border-purple-500 text-purple-300 px-4 py-2 rounded text-sm">
              {aiLoading ? '🤖 Generating...' : '🤖 AI Draft Proposal'}
            </button>
            <button onClick={submitBid}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm font-medium">
              Submit Bid
            </button>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
          </div>
          {aiDraft && (
            <div className="bg-purple-900/10 border border-purple-800 rounded p-3 text-gray-300 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
              <div className="text-purple-400 text-xs mb-2">🤖 AI Draft (click to use):</div>
              <div onClick={() => setBid((p) => ({ ...p, notes: aiDraft }))} className="cursor-pointer">{aiDraft}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
