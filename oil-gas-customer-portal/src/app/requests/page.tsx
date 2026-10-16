'use client';
import { useEffect, useState } from 'react';

const REQUEST_TYPES = ['operational_change', 'emergency_contact', 'maintenance_request', 'data_access', 'reporting_request'];

interface ServiceRequest {
  id: number;
  company: string;
  request_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [form, setForm] = useState({ request_type: 'operational_change', subject: '', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/service-requests').then(r => r.json()).then(d => setRequests(d.requests || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const r = await fetch('/api/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_id: 1, ...form }) });
    const data = await r.json();
    if (data.request) {
      setMsg('Request submitted! ID: REQ-' + String(data.request.id).padStart(4, '0'));
      setRequests(prev => [data.request, ...prev]);
      setForm({ request_type: 'operational_change', subject: '', description: '', priority: 'medium' });
    }
    setSubmitting(false);
  }

  const priorityColor: Record<string, string> = { low: 'text-gray-400', medium: 'text-blue-400', high: 'text-amber-400', urgent: 'text-red-400' };
  const statusColor: Record<string, string> = { open: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-amber-500/20 text-amber-400', closed: 'bg-green-500/20 text-green-400' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Service Requests</h1>
        <p className="text-gray-400 mt-1">Submit and track operational requests</p>
      </div>

      {/* Submit Form */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">New Service Request</h2>
        {msg && <div className="bg-green-900/20 border border-green-600/40 rounded-lg p-3 text-green-400 text-sm mb-4">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Request Type</label>
              <select value={form.request_type} onChange={e => setForm(p => ({ ...p, request_type: e.target.value }))}
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-blue-500">
                {REQUEST_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 text-sm focus:outline-none focus:border-blue-500">
                {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required
            placeholder="Subject"
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500" />
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required rows={4}
            placeholder="Describe your request in detail..."
            className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          <button type="submit" disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Request History */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e2a45]">
          <h2 className="text-white font-semibold">Request History</h2>
        </div>
        <div className="divide-y divide-[#1e2a45]/50">
          {requests.map(r => (
            <div key={r.id} className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-mono text-sm">REQ-{String(r.id).padStart(4, '0')}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusColor[r.status] || 'bg-gray-500/20 text-gray-400'}`}>{r.status.replace('_', ' ')}</span>
                    <span className={`text-xs font-medium ${priorityColor[r.priority] || 'text-gray-400'}`}>● {r.priority}</span>
                  </div>
                  <div className="text-gray-200 text-sm mt-1">{r.subject}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{r.request_type.replace(/_/g, ' ')} · {r.company} · {new Date(r.created_at).toLocaleDateString('en-CA')}</div>
                </div>
              </div>
              {r.description && <div className="text-gray-500 text-xs mt-2 ml-0 line-clamp-2">{r.description}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
