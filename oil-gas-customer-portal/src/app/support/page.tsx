'use client';
import { useEffect, useState } from 'react';

const QUICK_CHIPS = [
  'Where is my delivery?',
  'Download my invoice',
  'Quality certificate for batch',
  'How does PPE monitoring work?',
  'Contact my account manager',
];

const FAQS = [
  { q: 'How do I download my invoice?', a: 'Go to Invoices & Billing, find your invoice, and click the PDF button on the right side.' },
  { q: 'What does API gravity mean?', a: 'API gravity measures crude oil density. Light crude (>35°) is more valuable. Medium (25–35°), heavy (<25°) crude requires more processing.' },
  { q: 'How do I track my delivery?', a: 'Go to Delivery Tracking. Each delivery shows status: Scheduled, In Transit, or Delivered with volume and certificate information.' },
  { q: 'What is the HST rate on my invoices?', a: 'Ontario HST is 13% applied to the subtotal. This is shown as a separate line item on all invoices.' },
  { q: 'When will my contract renew?', a: 'Go to My Contracts. Contracts expiring within 90 days show an amber renewal alert with days remaining.' },
];

export default function SupportPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMocked, setAiMocked] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketBody, setTicketBody] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketMsg, setTicketMsg] = useState('');
  const [tickets, setTickets] = useState<Array<{ id: number; subject: string; status: string; created_at: string }>>([]);

  useEffect(() => {
    fetch('/api/support').then(r => r.json()).then(d => setTickets(d.tickets || []));
  }, []);

  async function askAI(q: string) {
    setQuestion(q);
    setAnswer('');
    setAiLoading(true);
    setAiMocked(false);
    const r = await fetch('/api/ai-faq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) });
    const data = await r.json();
    setAnswer(data.answer || data._reason || 'No response received.');
    setAiMocked(!!data._mock);
    setAiLoading(false);
  }

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: 1, subject: ticketSubject, body: ticketBody }) });
    const data = await r.json();
    if (data.ticket) {
      setTicketMsg('Ticket submitted successfully! ID: #' + data.ticket.id);
      setTicketSubject(''); setTicketBody('');
      setTickets(prev => [data.ticket, ...prev]);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Help Center</h1>
        <p className="text-gray-400 mt-1">AI-powered FAQ, knowledge base, and support tickets</p>
      </div>

      {/* AI Assistant */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">🤖 AI Assistant (Ollama llama3.2)</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_CHIPS.map(chip => (
            <button key={chip} onClick={() => askAI(chip)}
              className="bg-[#1e2a45] hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 text-xs px-3 py-1.5 rounded-full border border-[#2d3d5c] transition-colors">
              {chip}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && question.trim() && askAI(question)}
            placeholder="Ask a question about deliveries, invoices, quality certs..."
            className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
          <button onClick={() => question.trim() && askAI(question)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50" disabled={aiLoading}>
            {aiLoading ? '...' : 'Ask'}
          </button>
        </div>
        {(answer || aiLoading) && (
          <div className={`mt-4 p-4 rounded-lg border ${aiMocked ? 'bg-amber-900/20 border-amber-600/30' : 'bg-[#0a0e1a] border-[#1e2a45]'}`}>
            {aiMocked && <div className="text-amber-400 text-xs mb-2">⚠️ Mocked — Ollama not configured. Set OLLAMA_URL to enable.</div>}
            {aiLoading ? <div className="text-gray-400 text-sm">Thinking...</div> : <div className="text-gray-200 text-sm">{answer}</div>}
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-[#1e2a45] rounded-lg p-4">
              <div className="text-gray-200 font-medium text-sm mb-1">{faq.q}</div>
              <div className="text-gray-400 text-sm">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Ticket */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Submit Support Ticket</h2>
        {ticketMsg && <div className="bg-green-900/20 border border-green-600/40 rounded-lg p-3 text-green-400 text-sm mb-4">{ticketMsg}</div>}
        <form onSubmit={submitTicket} className="space-y-4">
          <input value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} required
            placeholder="Subject"
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
          <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value)}
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-blue-500 text-sm">
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
          <textarea value={ticketBody} onChange={e => setTicketBody(e.target.value)} required rows={4}
            placeholder="Describe your issue..."
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-4 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm resize-none" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">
            Submit Ticket
          </button>
        </form>
      </div>

      {/* Ticket History */}
      {tickets.length > 0 && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">My Tickets</h2>
          <div className="space-y-2">
            {tickets.map(t => (
              <div key={t.id} className="flex items-center justify-between border border-[#1e2a45] rounded-lg p-3">
                <div>
                  <div className="text-gray-200 text-sm">#{t.id} — {t.subject}</div>
                  <div className="text-gray-500 text-xs">{new Date(t.created_at).toLocaleDateString('en-CA')}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${t.status === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
