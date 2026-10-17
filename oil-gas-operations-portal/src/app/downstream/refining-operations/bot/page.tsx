'use client';
import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; source?: string; }

const CHIPS = [
  'Analyze refinery throughput',
  'Yield optimization opportunities',
  'Production forecast',
  'Top producing states analysis',
  'Crude distillation efficiency',
];

export default function RefiningBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Refining Operations AI assistant. I can analyze production data, yield optimization, throughput trends, and refinery KPIs. What would you like to explore?', source: 'system' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const r = await fetch('/api/downstream/refining-operations/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const d = await r.json();
      setMessages(prev => [...prev, { role: 'assistant', content: d.response, source: d.source }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response. Please try again.', source: 'error' }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-amber-900/40 bg-gray-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">RO</div>
          <div>
            <h1 className="text-amber-300 font-semibold">Refining Operations AI</h1>
            <p className="text-gray-500 text-xs">Powered by Ollama llama3.2 + RAG knowledge base</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-gray-500 text-xs">Live</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-amber-700 text-white'
                : 'bg-gray-800 text-gray-200 border border-gray-700'
            }`}>
              {m.content}
              {m.source && m.role === 'assistant' && (
                <p className="text-gray-600 text-xs mt-2">via {m.source}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick action chips */}
      <div className="px-6 pb-2">
        <div className="flex gap-2 flex-wrap">
          {CHIPS.map(c => (
            <button
              key={c}
              onClick={() => send(c)}
              disabled={loading}
              className="text-xs bg-amber-900/30 hover:bg-amber-800/50 border border-amber-800/50 text-amber-300 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-2">
        <div className="flex gap-3 bg-gray-900 border border-amber-900/40 rounded-xl p-3">
          <input
            className="flex-1 bg-transparent text-amber-50 placeholder-gray-600 outline-none text-sm"
            placeholder="Ask about refinery throughput, yield optimization, production trends…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
