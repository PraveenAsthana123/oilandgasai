'use client';
import { useEffect, useState } from 'react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', stream: 'upstream', revenue_cad: '', credit_limit_cad: '', payment_terms: 'Net 30', health_score: 75 });

  useEffect(() => {
    fetch('/api/accounts').then(r => r.json()).then(d => { setAccounts(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const submit = async () => {
    await fetch('/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    fetch('/api/accounts').then(r => r.json()).then(d => setAccounts(Array.isArray(d) ? d : []));
  };

  const healthColor = (score: number) => score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const streamColor: Record<string, string> = { upstream: 'text-blue-400', midstream: 'text-yellow-400', downstream: 'text-purple-400' };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Account / Company Management</h1>
          <p className="text-slate-400 text-sm mt-1">E&P companies, pipeline operators, refineries</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Account
        </button>
      </div>

      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-white">Add Account</h2>
          <div className="grid grid-cols-2 gap-3">
            {[['company', 'Company Name'], ['revenue_cad', 'Revenue CAD'], ['credit_limit_cad', 'Credit Limit CAD']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs text-slate-400 mb-1">{label}</label>
                <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Stream</label>
              <select value={form.stream} onChange={e => setForm(f => ({ ...f, stream: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option value="upstream">Upstream</option>
                <option value="midstream">Midstream</option>
                <option value="downstream">Downstream</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Payment Terms</label>
              <select value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5">
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Health Score (0-100)</label>
              <input type="number" min="0" max="100" value={form.health_score} onChange={e => setForm(f => ({ ...f, health_score: parseInt(e.target.value) }))} className="w-full bg-[#0a0e1a] border border-[#1e2a45] text-white text-sm rounded px-3 py-1.5" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm">Save</button>
            <button onClick={() => setShowForm(false)} className="border border-[#1e2a45] text-slate-300 px-4 py-1.5 rounded text-sm hover:bg-[#1e2a45]">Cancel</button>
          </div>
        </div>
      )}

      {/* Account Cards */}
      {loading ? <div className="text-slate-400">Loading accounts...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a: any) => (
            <div key={a.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-white">{a.company}</div>
                  <div className={`text-xs capitalize mt-0.5 ${streamColor[a.stream]}`}>{a.stream}</div>
                </div>
                <div className={`text-lg font-bold ${healthColor(a.health_score)}`}>{a.health_score}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">Revenue YTD</div>
                  <div className="text-emerald-400 font-semibold">${(parseFloat(a.revenue_cad) / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-slate-500">Credit Limit</div>
                  <div className="text-white">${(parseFloat(a.credit_limit_cad || 0) / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-slate-500">Payment Terms</div>
                  <div className="text-slate-300">{a.payment_terms}</div>
                </div>
                <div>
                  <div className="text-slate-500">Health Score</div>
                  <div className="w-full bg-[#1e2a45] rounded-full h-1.5 mt-1.5">
                    <div className={`h-1.5 rounded-full ${a.health_score >= 80 ? 'bg-emerald-500' : a.health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${a.health_score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="col-span-3 text-center py-8 text-slate-500">No accounts yet. <a href="/api/init" className="text-emerald-400 underline">Initialize database</a></div>
          )}
        </div>
      )}
    </div>
  );
}
