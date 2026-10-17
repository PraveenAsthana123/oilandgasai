'use client';
import { useState } from 'react';
import Link from 'next/link';

interface Message { role: 'user' | 'assistant'; content: string; ts: string }

export default function MechanicalMaintenanceBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const DEPT = 'mechanical-maintenance';

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { role: 'user', content: msg, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`/api/departments/${DEPT}/bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response ?? data.error ?? 'No response', ts: new Date().toISOString() }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${String(e)}`, ts: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 flex flex-col">
      <div className="p-4 border-b border-[#1e2a45] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-amber-400">🔧 Mechanical Maintenance Bot</h1>
          <p className="text-xs text-gray-400">Ollama-powered · dept: {DEPT}</p>
        </div>
        <Link href="/departments/mechanical-maintenance/dashboard" className="px-3 py-1.5 bg-[#1e2a45] text-gray-300 rounded-lg text-sm hover:bg-[#253456] transition-colors">
          ← Dashboard
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🔧</div>
            <div className="text-sm">Ask about equipment failures, maintenance schedules, vibration analysis, predictive maintenance.</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl rounded-xl p-3 text-sm ${
              m.role === 'user'
                ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                : 'bg-[#0f1629] text-gray-200 border border-[#1e2a45]'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              <div className="text-xs text-gray-500 mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-3 text-gray-400 text-sm animate-pulse">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#1e2a45]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about equipment failures, maintenance schedules, vibration analysis, predictive maintenance..."
            className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
