'use client';
import { useState } from 'react';

const QUICK_CHIPS = [
  'What certifications do I need for pipeline work?',
  'How do I submit an invoice?',
  'What is WSIB and how do I get clearance?',
  'How does the vendor performance scoring work?',
  'Interpret this MSA clause: "liquidated damages at 1% per week of delay"',
  'What is TRIF and how is it calculated?',
  'What safety requirements are needed for wellsite work?',
  'How long does the vendor approval process take?',
];

interface Message { role: 'user' | 'assistant'; text: string; ts: string; }

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hello! I\'m your Oil & Gas Vendor Portal AI Assistant powered by Ollama (llama3.2). I can help you with RFQ requirements, compliance documentation, invoice procedures, contract terms, and safety requirements. How can I help you today?', ts: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (question: string) => {
    const q = question || input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q, ts: new Date().toISOString() }]);
    setInput('');
    setLoading(true);
    const res = await fetch('/api/ai-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: 'assistant', text: data.response || data.error || 'No response', ts: new Date().toISOString() }]);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Vendor AI Assistant</h1>
        <p className="text-gray-400 text-sm mt-1">Powered by Ollama — llama3.2 · 30s timeout</p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 overflow-y-auto space-y-4 mb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-[#1e2a45] text-gray-300'}`}>
              {msg.role === 'assistant' && <div className="text-xs text-purple-400 mb-1">🤖 AI Assistant</div>}
              <div className="whitespace-pre-wrap">{msg.text}</div>
              <div className="text-xs mt-1 opacity-50">{new Date(msg.ts).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1e2a45] rounded-lg px-4 py-2 text-sm text-gray-400">
              <span className="animate-pulse">🤖 Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_CHIPS.slice(0, 4).map((chip) => (
          <button key={chip} onClick={() => send(chip)}
            className="text-xs bg-[#1e2a45] hover:bg-purple-900/30 border border-[#2a3a55] hover:border-purple-500 text-gray-300 px-3 py-1.5 rounded-full transition-colors">
            {chip.length > 40 ? chip.slice(0, 40) + '...' : chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Ask about certifications, invoices, contracts, safety..."
          className="flex-1 bg-[#0f1629] border border-[#1e2a45] text-white rounded-lg px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium">
          Send
        </button>
      </div>
    </div>
  );
}
