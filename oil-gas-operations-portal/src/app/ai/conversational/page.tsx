'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; ts: string; rag_used?: boolean };

const STREAM_STARTERS: Record<string, string[]> = {
  upstream: [
    'Analyze the well log pattern for formation evaluation',
    'What does an influx kick look like in drilling parameters?',
    'Explain Arps decline curve for my reservoir type',
    'What causes differential pipe sticking?',
    'How do you interpret LWD resistivity readings?',
  ],
  midstream: [
    'What are the leading indicators of compressor surge?',
    'How do I interpret ILI (intelligent pig) inspection results?',
    'Explain SCADA alarm rationalization best practices',
    'What causes pipeline pressure fluctuation?',
    'How is custody transfer metering calibrated?',
  ],
  downstream: [
    'What causes FCC catalyst deactivation?',
    'How to optimize crude blend for maximum middle distillate?',
    'Explain refinery linear programming model',
    'What are the warning signs of furnace tube fouling?',
    'How does vacuum distillation differ from atmospheric?',
  ],
  general: [
    'Explain the difference between upstream and downstream operations',
    'What are the main AI use cases in oil & gas?',
    'Describe the main HSE regulations for offshore drilling',
    'What is HAZOP and when is it performed?',
    'Explain gas chromatography in process monitoring',
  ],
};

const MODES = [
  { id: 'normal', label: 'Standard', desc: 'Balanced technical detail' },
  { id: 'expert', label: 'Expert', desc: 'Full engineering specifics' },
  { id: 'summary', label: 'Summary', desc: 'Executive 3-5 sentence brief' },
];

const STREAMS = ['general', 'upstream', 'midstream', 'downstream'];

function formatTime(ts: string) {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ts; }
}

export default function ConversationalAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState('general');
  const [mode, setMode] = useState('normal');
  const [sessionId] = useState(`conv_${Date.now()}`);
  const [ollamaDown, setOllamaDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text, ts: new Date().toISOString() };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          stream: stream === 'general' ? '' : stream,
          mode,
          dept_tag: 'conversational-ai',
        }),
      });
      const data = await resp.json() as { reply: string; rag_used?: boolean; _mock?: boolean };
      if (data._mock) setOllamaDown(true);
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        ts: new Date().toISOString(),
        rag_used: data.rag_used,
      };
      setMessages([...updatedMsgs, assistantMsg]);
    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: '⚠️ Failed to reach the AI backend.',
        ts: new Date().toISOString(),
      };
      setMessages([...updatedMsgs, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const starters = STREAM_STARTERS[stream] ?? STREAM_STARTERS.general;

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-start justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-1">AI / Conversational</div>
          <h1 className="text-xl font-bold text-white">Conversational AI — Technical Q&A</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            O&G engineering-grade Q&A · RAG-enhanced · Scope to specific stream
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-1">
            {STREAMS.map(s => (
              <button key={s} onClick={() => setStream(s)}
                className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                  stream === s ? 'bg-amber-500 text-black font-bold' : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'
                }`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                title={m.desc}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  mode === m.id ? 'bg-blue-500 text-white font-bold' : 'bg-[#1e2a45] text-gray-400 hover:text-gray-200'
                }`}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      {ollamaDown && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400 flex-shrink-0">
          ⚠️ AI unavailable — Ollama not running. Set OLLAMA_URL to connect.
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-xl flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="py-4">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🔬</div>
                <div className="text-gray-400 text-sm font-medium">
                  {stream === 'general' ? 'O&G Technical Q&A' : `${stream.charAt(0).toUpperCase() + stream.slice(1)} Operations Q&A`}
                </div>
                <div className="text-gray-600 text-xs mt-1">Mode: {MODES.find(m => m.id === mode)?.desc}</div>
              </div>
              <div className="text-xs text-gray-600 text-center mb-3 uppercase tracking-wider">Conversation starters</div>
              <div className="grid grid-cols-1 gap-2 max-w-xl mx-auto">
                {starters.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="text-left px-3 py-2 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg text-xs text-gray-400 hover:border-amber-500/30 hover:text-gray-200 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                  : 'bg-[#1e2a45] text-gray-200'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="text-xs text-gray-600 mb-1 flex gap-2">
                    <span>⛽ O&G AI</span>
                    {msg.rag_used && <span className="text-green-500">● RAG-enhanced</span>}
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                <div className="text-xs opacity-40 mt-1">{formatTime(msg.ts)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e2a45] rounded-xl p-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="animate-bounce text-blue-400 text-sm" style={{ animationDelay: `${d}ms` }}>●</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-[#1e2a45] flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder={`Ask ${stream} O&G question… (${MODES.find(m => m.id === mode)?.label} mode)`}
            className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 placeholder-gray-600"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg text-sm hover:bg-blue-400 disabled:opacity-50 transition-colors">
            Ask
          </button>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])}
              className="px-3 py-2 bg-[#1e2a45] text-gray-400 rounded-lg text-sm hover:text-gray-200 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
