'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SalesQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotes').then(r => r.json()).then(d => {
      setQuotes(Array.isArray(d) ? d : d?.quotes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-slate-700 text-slate-300',
    sent: 'bg-blue-800 text-blue-300',
    accepted: 'bg-emerald-800 text-emerald-300',
    rejected: 'bg-red-900 text-red-300',
    expired: 'bg-gray-700 text-gray-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/sales" className="hover:text-emerald-400">Sales</Link>
            <span>/</span>
            <span className="text-gray-300">Quotes</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Quotes</h1>
          <p className="text-gray-400 mt-1">All quotes — draft, sent, accepted, and expired</p>
        </div>
        <Link href="/quotes" className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded hover:bg-emerald-500/30 transition">
          Full Quotes →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['draft', 'sent', 'accepted', 'rejected'].map(s => (
          <div key={s} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
            <div className="text-xs text-gray-400 capitalize mb-1">{s}</div>
            <div className="text-xl font-bold text-white">{quotes.filter(q => q.status === s).length}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-emerald-400">Loading quotes...</div>
      ) : quotes.length === 0 ? (
        <div className="text-gray-500 text-sm">No quotes yet.</div>
      ) : (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a45] text-gray-400 text-xs">
                <th className="px-4 py-3 text-left">Quote #</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Expires</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q: any) => (
                <tr key={q.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                  <td className="px-4 py-3 text-emerald-400 font-mono text-xs">{q.quote_number || `Q-${q.id}`}</td>
                  <td className="px-4 py-3 text-white">{q.account_name || q.company}</td>
                  <td className="px-4 py-3 text-gray-300">${parseFloat(q.total_cad || q.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[q.status] || 'bg-gray-700 text-gray-300'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{q.expiry_date ? new Date(q.expiry_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
