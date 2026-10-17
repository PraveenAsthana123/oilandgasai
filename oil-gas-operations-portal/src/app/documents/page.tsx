'use client';
import { useEffect, useState } from 'react';

type Doc = {
  id: number;
  name: string;
  category: string;
  dept: string;
  description: string;
  size_kb: number;
  uploaded_by: string;
  status: string;
  ai_summary: string | null;
  created_at: string;
};

type Kpis = {
  total: number;
  added_this_month: number;
  pending_review: number;
  technical: number;
  regulatory: number;
  safety: number;
  commercial: number;
  well_report: number;
};

const CATEGORIES = ['All', 'Technical', 'Regulatory', 'Safety', 'Commercial', 'Well Report'];
const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-400 bg-green-400/10',
  archived: 'text-gray-400 bg-gray-400/10',
  'under review': 'text-amber-400 bg-amber-400/10',
};

function fmtSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbDown, setDbDown] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [summaryMap, setSummaryMap] = useState<Record<number, string>>({});
  const [summarizing, setSummarizing] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState({ name: '', category: 'Technical', dept: '', description: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/documents');
      const d = await r.json();
      if (d._mock) { setDbDown(true); return; }
      setDocs(d.data || []);
      setKpis(d.kpis || null);
    } catch {
      setDbDown(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function summarize(doc: Doc) {
    setSummarizing(p => ({ ...p, [doc.id]: true }));
    try {
      const r = await fetch(`/api/documents/${doc.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'summarize' }),
      });
      const d = await r.json();
      setSummaryMap(p => ({ ...p, [doc.id]: d.summary || 'No summary returned.' }));
    } catch {
      setSummaryMap(p => ({ ...p, [doc.id]: 'Error contacting AI service.' }));
    } finally {
      setSummarizing(p => ({ ...p, [doc.id]: false }));
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, size_kb: Math.floor(Math.random() * 5000) + 100, uploaded_by: 'Current User' }),
      });
      setForm({ name: '', category: 'Technical', dept: '', description: '' });
      setShowUpload(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  const filtered = docs.filter(d => {
    const matchCat = catFilter === 'All' || d.category === catFilter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.dept.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (dbDown) return (
    <div className="p-8 text-center">
      <div className="text-amber-400 text-4xl mb-4">⚠️</div>
      <div className="text-gray-300 text-lg">Database unavailable</div>
      <div className="text-gray-500 text-sm mt-2">Set DATABASE_URL to enable document management</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Management</h1>
          <p className="text-gray-400 text-sm mt-1">Technical manuals, well reports, regulatory filings, safety documentation</p>
        </div>
        <button onClick={() => setShowUpload(v => !v)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          + Upload Document
        </button>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: kpis.total, icon: '📄' },
            { label: 'Added This Month', value: kpis.added_this_month, icon: '📥' },
            { label: 'Pending Review', value: kpis.pending_review, icon: '⏳' },
            { label: 'Well Reports', value: kpis.well_report, icon: '🛢️' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{k.value}</div>
              <div className="text-xs text-gray-400">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Add Document Record</h2>
          {/* Drag-drop area */}
          <div className="border-2 border-dashed border-[#1e2a45] rounded-lg p-8 text-center mb-4 hover:border-amber-500/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">📤</div>
            <div className="text-gray-400 text-sm">Drag and drop files here, or click to browse</div>
            <div className="text-gray-600 text-xs mt-1">Metadata only — no actual file stored</div>
          </div>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Document Name *" required
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none">
              {['Technical', 'Regulatory', 'Safety', 'Commercial', 'Well Report'].map(c =>
                <option key={c}>{c}</option>)}
            </select>
            <input value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}
              placeholder="Department"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Description"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none resize-none" rows={2} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Record'}
              </button>
              <button type="button" onClick={() => setShowUpload(false)}
                className="border border-[#1e2a45] text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none flex-1 min-w-48" />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                catFilter === c ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-gray-200'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a45]">
                {['Document Name', 'Category', 'Dept', 'Uploaded By', 'Size', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No documents found</td></tr>
              ) : filtered.map(doc => (
                <>
                  <tr key={doc.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-gray-300 font-medium text-xs">{doc.name}</div>
                      <div className="text-gray-600 text-xs mt-0.5 truncate max-w-xs">{doc.description?.substring(0, 60)}...</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">{doc.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{doc.dept}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{doc.uploaded_by}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtSize(doc.size_kb)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[doc.status] || 'text-gray-400'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-gray-400 hover:text-gray-200 border border-[#1e2a45] px-2 py-1 rounded">
                          ⬇ Download
                        </button>
                        <button onClick={() => summarize(doc)} disabled={summarizing[doc.id]}
                          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 px-2 py-1 rounded disabled:opacity-50 whitespace-nowrap">
                          {summarizing[doc.id] ? '...' : '🤖 AI Summary'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {(summaryMap[doc.id] || doc.ai_summary) && (
                    <tr key={`sum-${doc.id}`} className="border-b border-[#1e2a45]/50 bg-amber-500/5">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="text-xs text-amber-300/80">
                          <span className="font-semibold text-amber-400">AI Summary: </span>
                          {summaryMap[doc.id] || doc.ai_summary}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category breakdown */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Technical', value: kpis.technical, color: 'blue' },
            { label: 'Regulatory', value: kpis.regulatory, color: 'purple' },
            { label: 'Safety', value: kpis.safety, color: 'red' },
            { label: 'Commercial', value: kpis.commercial, color: 'green' },
            { label: 'Well Report', value: kpis.well_report, color: 'amber' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">{k.value}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
