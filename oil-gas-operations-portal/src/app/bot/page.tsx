'use client';

import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; ts: string; rag_used?: boolean };
type Session = { session_id: string; messages: Message[]; topic: string; ts: string };

const QUICK_ACTIONS = [
  'What are the top PPE risks in upstream operations?',
  'Explain decline curve analysis for reservoir engineering',
  'List common compressor failure modes in midstream',
  'How does Intelligent Pig (ILI) inspection work?',
  'Explain SCADA anomaly detection for pipeline monitoring',
];

const STREAMS = ['All Streams', 'upstream', 'midstream', 'downstream'];

function formatTime(ts: string) {
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ts; }
}

export default function BotPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<string>(`sess_${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState('');
  const [ollamaDown, setOllamaDown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load sessions from localStorage for UI persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ogo_bot_sessions');
      if (saved) setSessions(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function saveSession(sid: string, msgs: Message[]) {
    const updated = sessions.map(s => s.session_id === sid ? { ...s, messages: msgs } : s);
    const exists = sessions.some(s => s.session_id === sid);
    const final = exists ? updated : [{ session_id: sid, messages: msgs, topic: msgs[0]?.content.slice(0, 40) ?? 'New Chat', ts: new Date().toISOString() }, ...sessions];
    setSessions(final);
    try { localStorage.setItem('ogo_bot_sessions', JSON.stringify(final.slice(0, 20))); } catch { /* ignore */ }
  }

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
        body: JSON.stringify({ message: text, session_id: currentSession, stream }),
      });
      const data = await resp.json() as { reply: string; rag_used?: boolean; _mock?: boolean };
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.reply,
        ts: new Date().toISOString(),
        rag_used: data.rag_used,
      };
      if (data._mock) setOllamaDown(true);
      const final = [...updatedMsgs, assistantMsg];
      setMessages(final);
      saveSession(currentSession, final);
    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: '⚠️ Failed to reach the AI backend. Please check your connection.',
        ts: new Date().toISOString(),
      };
      setMessages([...updatedMsgs, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    const newSid = `sess_${Date.now()}`;
    setCurrentSession(newSid);
    setMessages([]);
    setOllamaDown(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Panel: Sessions */}
      <div className="w-64 bg-[#0f1629] border border-[#1e2a45] rounded-xl flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#1e2a45]">
          <button onClick={newChat}
            className="w-full py-2 px-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium hover:bg-amber-500/30 transition-colors">
            + New Chat
          </button>
        </div>
        <div className="p-3 border-b border-[#1e2a45]">
          <select value={stream} onChange={e => setStream(e.target.value === 'All Streams' ? '' : e.target.value)}
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-gray-300 text-xs rounded px-2 py-1.5">
            {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 && (
            <div className="text-xs text-gray-600 text-center py-4">No previous conversations</div>
          )}
          {sessions.map(s => (
            <button key={s.session_id}
              onClick={() => { setCurrentSession(s.session_id); setMessages(s.messages); }}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-xs transition-colors ${
                currentSession === s.session_id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:bg-[#1e2a45] hover:text-gray-200'
              }`}>
              <div className="font-medium truncate">{s.topic || 'Chat'}</div>
              <div className="text-gray-600 text-xs">{s.messages.length} msgs</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat */}
      <div className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1e2a45] flex items-center justify-between">
          <div>
            <div className="font-semibold text-white">Oil & Gas AI Assistant</div>
            <div className="text-xs text-gray-500">RAG-enhanced · O&G domain knowledge · Powered by Ollama</div>
          </div>
          {stream && <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 capitalize">{stream}</span>}
        </div>

        {/* Ollama warning */}
        {ollamaDown && (
          <div className="mx-4 mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400">
            ⚠️ AI Assistant unavailable — Ollama not running. Set OLLAMA_URL to connect.
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⛽</div>
              <div className="text-gray-400 text-sm font-medium">Oil & Gas AI Agency Assistant</div>
              <div className="text-gray-600 text-xs mt-1 mb-6">Ask about upstream, midstream, downstream operations, AI models, or HSE</div>
              <div className="space-y-2 max-w-md mx-auto">
                {QUICK_ACTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="block w-full text-left px-3 py-2 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg text-xs text-gray-400 hover:border-amber-500/30 hover:text-gray-200 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${
                msg.role === 'user'
                  ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                  : 'bg-[#1e2a45] text-gray-200'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs opacity-50">{formatTime(msg.ts)}</span>
                  {msg.rag_used && <span className="text-xs text-green-400 opacity-70">● RAG</span>}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e2a45] rounded-xl p-3 text-gray-400">
                <div className="flex gap-1">
                  <span className="animate-bounce text-amber-400" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="animate-bounce text-amber-400" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="animate-bounce text-amber-400" style={{ animationDelay: '300ms' }}>●</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1e2a45]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about O&G operations, AI models, safety procedures…"
              className="flex-1 bg-[#0a0e1a] border border-[#1e2a45] text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 placeholder-gray-600"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
