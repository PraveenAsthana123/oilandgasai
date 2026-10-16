'use client';
import { useState } from 'react';

const FAQS = [
  { q: 'How do I submit an invoice?', a: 'Go to Invoice Management → New Invoice. Select your PO number, enter the amount (excl. HST), add HST (13% in Ontario, Alberta has no provincial HST), and submit. Payment is processed per your contract payment terms (Net 30/45/60).' },
  { q: 'What certifications are required for pipeline work?', a: 'For pipeline work in Alberta, you typically need: COR Certificate, Liability Insurance ($5M minimum), WSIB Clearance, ISO 9001, and relevant safety training (CSTS, H2S Alive). Pipeline NDE work requires additional NDT Level II certifications.' },
  { q: 'How is the performance score calculated?', a: 'The overall score (1–5) is a weighted average of: On-Time Delivery % (weight 40%), Quality Acceptance Rate % (weight 30%), and Invoice Accuracy % (weight 30%). TRIF and LTI rates are tracked separately as safety KPIs.' },
  { q: 'What is WSIB clearance?', a: 'WSIB (Workplace Safety and Insurance Board) clearance confirms your company is in good standing and your workers are covered under WSIB. You must provide a current clearance letter (valid 90 days) before starting any work in Ontario.' },
  { q: 'How do I raise a dispute?', a: 'Navigate to Dispute Management → New Dispute. Select the dispute type (invoice, quality, or PO change), provide the related record number, and describe the issue. Our procurement team will respond within 5 business days.' },
];

export default function SupportPage() {
  const [ticket, setTicket] = useState({ subject: '', body: '' });
  const [submitted, setSubmitted] = useState(false);
  const [aiQ, setAiQ] = useState('');
  const [aiA, setAiA] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const submitTicket = async () => {
    await fetch('/api/admin/audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'vendor-1', action: 'support_ticket', record_type: 'support', details: ticket }),
    });
    setSubmitted(true);
  };

  const askAI = async () => {
    if (!aiQ) return;
    setAiLoading(true);
    const res = await fetch('/api/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: aiQ }),
    });
    const data = await res.json();
    setAiA(data.response || '');
    setAiLoading(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vendor Support</h1>
        <p className="text-gray-400 text-sm mt-1">Get help with portal questions, contact procurement, or use AI Q&A</p>
      </div>

      {/* AI Q&A */}
      <div className="bg-[#0f1629] border border-purple-500/50 rounded-lg p-5 space-y-3">
        <h2 className="text-white font-semibold">🤖 AI-Powered Q&A</h2>
        <div className="flex gap-2">
          <input type="text" value={aiQ} onChange={(e) => setAiQ(e.target.value)}
            placeholder="Ask anything about the portal, invoicing, certifications..."
            className="flex-1 bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
          <button onClick={askAI} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
            {aiLoading ? '...' : 'Ask'}
          </button>
        </div>
        {aiA && (
          <div className="bg-purple-900/10 border border-purple-800 rounded p-3 text-gray-300 text-sm whitespace-pre-wrap">{aiA}</div>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-3">
        <h2 className="text-white font-semibold">Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
          <details key={i} className="group">
            <summary className="flex justify-between items-center cursor-pointer py-2 border-b border-[#1e2a45] text-gray-300 text-sm hover:text-white">
              {faq.q}
              <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="pt-2 pb-3 text-gray-400 text-sm">{faq.a}</div>
          </details>
        ))}
      </div>

      {/* Ticket */}
      {!submitted ? (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-5 space-y-4">
          <h2 className="text-white font-semibold">Submit Support Ticket</h2>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Subject</label>
            <input type="text" value={ticket.subject} onChange={(e) => setTicket((p) => ({ ...p, subject: e.target.value }))}
              className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Description</label>
            <textarea rows={4} value={ticket.body} onChange={(e) => setTicket((p) => ({ ...p, body: e.target.value }))}
              className="w-full bg-[#1e2a45] border border-[#2a3a55] text-white rounded px-3 py-2 text-sm focus:border-purple-500 focus:outline-none" />
          </div>
          <button onClick={submitTicket} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded text-sm">Submit Ticket</button>
        </div>
      ) : (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-green-300 text-sm">
          ✓ Ticket submitted. Our procurement team will respond within 2 business days.
        </div>
      )}
    </div>
  );
}
