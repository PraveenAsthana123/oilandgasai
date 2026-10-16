'use client';
import { useEffect, useState } from 'react';

interface Approval {
  id: number;
  approval_type: string;
  requested_by: string;
  description: string;
  status: string;
  reviewed_by: string;
  reviewed_at: string;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  price_discount: 'Price Discount',
  ai_model_deploy: 'AI Model Deployment',
  role_escalation: 'Role Escalation',
  contract_change: 'Contract Change',
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/approvals').then(r => r.json()).then(d => { setApprovals(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const review = async (id: number, status: 'approved' | 'rejected') => {
    await fetch('/api/approvals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, reviewed_by: 'admin@oilgas.com' }),
    });
    setMsg(`Approval ${status}`);
    setTimeout(() => setMsg(''), 3000);
    load();
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  const pending = approvals.filter(a => a.status === 'pending');
  const reviewed = approvals.filter(a => a.status !== 'pending');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-gray-400 text-sm mt-1">{pending.length} pending · {reviewed.length} reviewed</p>
        </div>
      </div>
      {msg && <div className="mb-4 text-green-400 text-sm">{msg}</div>}

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-white font-semibold mb-3">Awaiting Review ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(a => (
              <div key={a.id} className="bg-[#0f1629] border border-yellow-500/30 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                        {TYPE_LABELS[a.approval_type] ?? a.approval_type}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Pending</span>
                    </div>
                    <div className="text-white text-sm font-medium mt-1">{a.description}</div>
                    <div className="text-gray-400 text-xs mt-1">Requested by: {a.requested_by} · {new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => review(a.id, 'approved')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => review(a.id, 'rejected')}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-3">Review History</h2>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  {['Type', 'Description', 'Requested By', 'Status', 'Reviewed By', 'Date'].map(h => (
                    <th key={h} className="text-left text-gray-400 text-xs font-medium px-4 py-3 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviewed.map(a => (
                  <tr key={a.id} className="border-b border-[#1e2a45] hover:bg-[#0a0e1a]">
                    <td className="px-4 py-3 text-xs text-gray-400">{TYPE_LABELS[a.approval_type] ?? a.approval_type}</td>
                    <td className="px-4 py-3 text-white text-sm max-w-xs truncate">{a.description}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{a.requested_by}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{a.reviewed_by}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{a.reviewed_at ? new Date(a.reviewed_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {approvals.length === 0 && <div className="text-center py-12 text-gray-500">No approvals found — initialize DB first</div>}
    </div>
  );
}
