'use client';
import { useEffect, useRef, useState } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; ts: string; }

const CHIPS = [
  'Recent alarm summary',
  'Device health check',
  'Anomaly root cause analysis',
  'High CO alert devices',
  'SCADA system status',
];

export default function ScadaControlBotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch('/api/midstream/scada-control/bot').then(r => r.json()).then(d => setMessages(d.history ?? [])); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text, ts: new Date().toISOString() }]);
    setInput(''); setLoading(true);
    try {
      const d = await (await fetch('/api/midstream/scada-control/bot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, dept: 'midstream-scada-control' }) })).json();
      setMessages(prev => [...prev, { role: 'assistant', content: d.response ?? d.error ?? 'No response', ts: new Date().toISOString() }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-6 space-y-4">
      <div><h1 className="text-2xl font-bold text-white">SCADA Control — AI Bot</h1><p className="text-gray-400 text-sm mt-1">Ollama-powered assistant for SCADA alarms and anomaly analysis</p></div>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(chip => <button key={chip} onClick={() => send(chip)} disabled={loading} className="bg-[#1e2a45] hover:bg-[#2a3a5a] border border-[#2a3a5a] text-amber-400 text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">{chip}</button>)}
      </div>
      <div className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && !loading && <div className="text-gray-500 text-sm text-center mt-8">Ask about SCADA alarms, device health, or anomaly patterns.</div>}
        {messages.map((m, i) => (<div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${m.role==='user'?'bg-amber-500 text-black':'bg-[#1e2a45] text-gray-200'}`}><div className="whitespace-pre-wrap">{m.content}</div><div className="text-xs opacity-50 mt-1">{new Date(m.ts).toLocaleTimeString()}</div></div></div>))}
        {loading && <div className="flex justify-start"><div className="bg-[#1e2a45] rounded-xl px-4 py-2.5 text-amber-400 text-sm animate-pulse">Analyzing…</div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&!e.shiftKey&&send(input)} placeholder="Ask about SCADA control and sensor data…" disabled={loading}
          className="flex-1 bg-[#0f1629] border border-[#1e2a45] text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-500 disabled:opacity-50" />
        <button onClick={() => send(input)} disabled={loading||!input.trim()} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-5 py-2.5 rounded-xl text-sm">Send</button>
      </div>
    </div>
  );
}
