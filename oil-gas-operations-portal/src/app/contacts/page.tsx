'use client';
import { useEffect, useState } from 'react';

type Contact = {
  id: number;
  name: string;
  role: string;
  company: string;
  phone: string;
  email: string;
  type: string;
  notes: string;
  created_at: string;
};

type Kpis = {
  total: number;
  vendors: number;
  contractors: number;
  regulators: number;
  internal: number;
};

const TYPE_FILTERS = ['All', 'Internal', 'Vendor', 'Contractor', 'Regulator', 'Emergency'];

const TYPE_COLORS: Record<string, string> = {
  'Internal': 'text-blue-400 bg-blue-400/10',
  'Vendor': 'text-green-400 bg-green-400/10',
  'Contractor': 'text-amber-400 bg-amber-400/10',
  'Regulator': 'text-purple-400 bg-purple-400/10',
  'Emergency': 'text-red-400 bg-red-400/10',
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function avatarColor(type: string) {
  const map: Record<string, string> = {
    'Internal': 'bg-blue-500/20 text-blue-400',
    'Vendor': 'bg-green-500/20 text-green-400',
    'Contractor': 'bg-amber-500/20 text-amber-400',
    'Regulator': 'bg-purple-500/20 text-purple-400',
    'Emergency': 'bg-red-500/20 text-red-400',
  };
  return map[type] || 'bg-gray-500/20 text-gray-400';
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbDown, setDbDown] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', phone: '', email: '', type: 'Internal', notes: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/contacts');
      const d = await r.json();
      if (d._mock) { setDbDown(true); return; }
      setContacts(d.data || []);
      setKpis(d.kpis || null);
    } catch {
      setDbDown(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', role: '', company: '', phone: '', email: '', type: 'Internal', notes: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  const filtered = contacts.filter(c => {
    const matchType = typeFilter === 'All' || c.type === typeFilter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (dbDown) return (
    <div className="p-8 text-center">
      <div className="text-amber-400 text-4xl mb-4">⚠️</div>
      <div className="text-gray-300 text-lg">Database unavailable</div>
      <div className="text-gray-500 text-sm mt-2">Set DATABASE_URL to enable contact directory</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Vendors, contractors, regulators, and internal teams</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          + Add Contact
        </button>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Contacts', value: kpis.total, icon: '👥' },
            { label: 'Vendors', value: kpis.vendors, icon: '🏢' },
            { label: 'Contractors', value: kpis.contractors, icon: '🔧' },
            { label: 'Regulators', value: kpis.regulators, icon: '⚖️' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{k.value}</div>
              <div className="text-xs text-gray-400">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Form */}
      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Add New Contact</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Full Name *" required
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              placeholder="Role / Title"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              placeholder="Company / Organization"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none">
              {['Internal', 'Vendor', 'Contractor', 'Regulator', 'Emergency'].map(t =>
                <option key={t}>{t}</option>)}
            </select>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="Phone"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="Email" type="email"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notes"
              className="md:col-span-2 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none resize-none"
              rows={2} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Contact'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-[#1e2a45] text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="bg-[#0f1629] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none flex-1 min-w-48" />
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-gray-200'
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Contact cards grid */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No contacts found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(c.type)}`}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-200 font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-gray-500 text-xs truncate">{c.role}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[c.type] || 'text-gray-400 bg-gray-400/10'}`}>
                  {c.type}
                </span>
              </div>

              <div className="text-xs text-gray-500 font-medium mb-3 truncate">{c.company}</div>

              <div className="space-y-1.5">
                {c.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>📞</span>
                    <a href={`tel:${c.phone}`} className="hover:text-amber-400 transition-colors">{c.phone}</a>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>✉️</span>
                    <a href={`mailto:${c.email}`} className="hover:text-amber-400 transition-colors truncate">{c.email}</a>
                  </div>
                )}
              </div>

              {c.notes && (
                <div className="mt-3 pt-3 border-t border-[#1e2a45] text-xs text-gray-600 line-clamp-2">{c.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
