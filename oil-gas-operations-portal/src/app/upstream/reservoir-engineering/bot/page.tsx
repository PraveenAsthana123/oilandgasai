'use client';
import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; rag_chunks?: number; latency_ms?: number; }

const QUICK_ACTIONS = [
  'What are the largest proven reserves globally?',
  'Compare Active vs Development reservoirs',
  'Explain EOR methods for heavy crude',
];

export default function ReservoirBotPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello! I\'m your Reservoir Engineering AI assistant. I can help analyze reservoir data, reserves, production capacity, and provide technical guidance on reservoir management. What would you like to explore?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (msg?: string) => {
    const message = msg ?? input.trim();
    if (!message || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setLoading(true);
    try {
      const r = await fetch('/api/upstream/reservoir-engineering/bot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) });
      const d = await r.json();
      setMessages(prev => [...prev, { role: 'assistant', content: d.response, rag_chunks: d.rag_chunks_used, latency_ms: d.latency_ms }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Error contacting AI service.' }]); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 flex flex-col">
      <div className="border-b border-[#1e2a45] p-4 bg-[#0f1629]">
        <h1 className="text-lg font-bold text-amber-400">Reservoir Engineering — AI Assistant</h1>
        <p className="text-xs text-gray-500">Powered by Ollama (llama3.2) + RAG vector context</p>
      </div>
      <div className="p-4 border-b border-[#1e2a45]">
        <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(q => <button key={q} onClick={() => send(q)} disabled={loading} className="text-xs px-3 py-1.5 bg-[#1e2a45] hover:bg-[#2a3a5a] text-amber-300 rounded-full border border-[#2a3a5a] transition-colors disabled:opacity-50">{q}</button>)}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-300'}`}>
              {m.role === 'assistant' && <p className="text-xs text-amber-400 font-semibold mb-1">Reservoir AI</p>}
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.rag_chunks !== undefined && <p className="text-xs text-gray-500 mt-2">{m.rag_chunks > 0 ? `RAG context found: ${m.rag_chunks} chunks` : 'No RAG context'} · {m.latency_ms}ms</p>}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl px-4 py-3"><p className="text-xs text-amber-400 mb-1">Reservoir AI</p><div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-[#1e2a45] bg-[#0f1629]">
        <div className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())} placeholder="Ask about reservoir data, reserves, production capacity..." className="flex-1 bg-[#1e2a45] border border-[#2a3a5a] rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500"/>
          <button onClick={() => send()} disabled={loading || !input.trim()} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">Send</button>
        </div>
      </div>
    </div>
  );
}
