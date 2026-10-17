'use client';

import { useState, useEffect } from 'react';

interface Approval {
  id: number;
  item_type: string;
  title: string;
  submitted_by: string;
  priority: string;
  status: string;
  reviewer: string | null;
  review_comment: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface Stats {
  pending: number;
  approved_today: number;
  rejected: number;
  avg_hours: string;
}

interface Me {
  role: string;
  name: string;
  userId: string | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  low: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  approved: 'text-green-400 bg-green-500/10 border-green-500/30',
  rejected: 'text-red-400 bg-red-500/10 border-red-500/30',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved_today: 0, rejected: 0, avg_hours: '0.0' });
  const [me, setMe] = useState<Me>({ role: 'guest', name: 'Guest', userId: null });
  const [mock, setMock] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [commentId, setCommentId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const isManager = ['admin', 'manager'].includes(me.role);

  function loadData() {
    fetch('/api/approvals')
      .then(r => r.json())
      .then(d => {
        setApprovals(d.approvals || []);
        setStats(d.stats || { pending: 0, approved_today: 0, rejected: 0, avg_hours: '0.0' });
        if (d._mock) setMock(true);
      })
      .catch(() => setMock(true));
  }

  useEffect(() => {
    loadData();
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setMe(d))
      .catch(() => {});
  }, []);

  async function handleAction(id: number, action: 'approve' | 'reject') {
    setActionId(id);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment: commentId === id ? comment : '' }),
      });
      const data = await res.json();
      if (data.ok) {
        loadData();
        setCommentId(null);
        setComment('');
      }
    } catch {}
    setActionId(null);
  }

  const filtered = approvals.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (!isManager && a.submitted_by !== (me.userId || '')) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">✅</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Approvals</h1>
              <p className="text-gray-500 text-sm">Permits, MOC, vendor invoices, budget requests</p>
            </div>
            {mock && <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded">⚠️ DB offline</span>}
          </div>
          <div className="text-right">
            <div className="text-gray-300 text-sm font-medium">{me.name}</div>
            <div className="text-gray-600 text-xs capitalize">{me.role}</div>
          </div>
        </div>

        {/* Role gate notice */}
        {!isManager && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-5 flex items-start gap-3">
            <span className="text-amber-400 text-lg">🔒</span>
            <div>
              <div className="text-amber-300 font-medium text-sm">Manager / Admin Only</div>
              <div className="text-amber-400/70 text-xs mt-0.5">
                You can only view your own submitted items. Login as admin to review and approve all requests.
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending My Review', value: stats.pending, icon: '⏳', color: 'text-amber-400' },
            { label: 'Approved Today', value: stats.approved_today, icon: '✅', color: 'text-green-400' },
            { label: 'Rejected', value: stats.rejected, icon: '✗', color: 'text-red-400' },
            { label: 'Avg Approval (hrs)', value: stats.avg_hours, icon: '⏱️', color: 'text-blue-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-gray-500 text-xs">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-[#0f1629] rounded-xl p-1 border border-[#1e2a45] w-fit">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
              }`}>
              {f} {f === 'all' ? `(${approvals.length})` : `(${approvals.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-600">No approvals found for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2a45] text-gray-500 text-xs uppercase">
                    <th className="px-4 py-3 text-left">Item Type</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Submitted By</th>
                    <th className="px-4 py-3 text-left">Submitted</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    {isManager && <th className="px-4 py-3 text-left">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <>
                      <tr key={a.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-xs bg-[#1e2a45] px-2 py-0.5 rounded">{a.item_type}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-200 font-medium max-w-[220px]">
                          <div className="truncate">{a.title}</div>
                          {a.review_comment && (
                            <div className="text-gray-600 text-xs mt-0.5 truncate">&ldquo;{a.review_comment}&rdquo;</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{a.submitted_by}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{timeAgo(a.submitted_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded border text-xs font-medium capitalize ${PRIORITY_COLORS[a.priority] || 'text-gray-400'}`}>
                            {a.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded border text-xs font-medium capitalize ${STATUS_COLORS[a.status] || 'text-gray-400'}`}>
                            {a.status}
                          </span>
                        </td>
                        {isManager && (
                          <td className="px-4 py-3">
                            {a.status === 'pending' ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setCommentId(commentId === a.id ? null : a.id)}
                                  className="px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors"
                                  title="Add comment"
                                >
                                  💬
                                </button>
                                <button
                                  onClick={() => handleAction(a.id, 'approve')}
                                  disabled={actionId === a.id}
                                  className="px-2.5 py-1 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded transition-colors disabled:opacity-50"
                                >
                                  {actionId === a.id ? '…' : '✓'}
                                </button>
                                <button
                                  onClick={() => handleAction(a.id, 'reject')}
                                  disabled={actionId === a.id}
                                  className="px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded transition-colors disabled:opacity-50"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-xs">
                                {a.reviewer ? `By ${a.reviewer.split('@')[0]}` : '—'}
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                      {isManager && commentId === a.id && a.status === 'pending' && (
                        <tr key={`comment-${a.id}`} className="border-b border-[#1e2a45]/30 bg-[#0a0e1a]">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="flex gap-2">
                              <input
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Optional review comment…"
                                className="flex-1 bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-amber-500/50"
                              />
                              <button onClick={() => handleAction(a.id, 'approve')} disabled={actionId === a.id}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded text-xs disabled:opacity-50">
                                Approve
                              </button>
                              <button onClick={() => handleAction(a.id, 'reject')} disabled={actionId === a.id}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded text-xs disabled:opacity-50">
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
