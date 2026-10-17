'use client';
import { useEffect, useState } from 'react';

type BlogPost = {
  id: number;
  title: string;
  category: string;
  content: string;
  author: string;
  tags: string;
  read_time_mins: number;
  featured: boolean;
  ai_generated: boolean;
  created_at: string;
};

const CATEGORIES = ['All', 'Technology', 'Safety', 'Regulatory', 'Operations', 'AI/ML', 'Industry News'];

const CAT_COLORS: Record<string, string> = {
  'AI/ML': 'text-purple-400 bg-purple-400/10',
  'Technology': 'text-blue-400 bg-blue-400/10',
  'Safety': 'text-red-400 bg-red-400/10',
  'Regulatory': 'text-amber-400 bg-amber-400/10',
  'Operations': 'text-green-400 bg-green-400/10',
  'Industry News': 'text-cyan-400 bg-cyan-400/10',
};

function excerpt(content: string, chars = 160) {
  const stripped = content.replace(/\n+/g, ' ').trim();
  return stripped.length > chars ? stripped.substring(0, chars) + '...' : stripped;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featured, setFeatured] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbDown, setDbDown] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showWrite, setShowWrite] = useState(false);
  const [readPost, setReadPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: '', category: 'Operations', content: '', author: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/blog');
      const d = await r.json();
      if (d._mock) { setDbDown(true); return; }
      setPosts(d.data || []);
      setFeatured(d.featured || null);
    } catch {
      setDbDown(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function generateWithAI() {
    if (!form.title) return;
    setGenerating(true);
    try {
      const r = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, category: form.category, ai_assist: true, author: form.author || 'AI Generated', tags: form.tags }),
      });
      const d = await r.json();
      if (d.data) {
        setShowWrite(false);
        setForm({ title: '', category: 'Operations', content: '', author: '', tags: '' });
        load();
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      setForm({ title: '', category: 'Operations', content: '', author: '', tags: '' });
      setShowWrite(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  const filtered = posts.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (dbDown) return (
    <div className="p-8 text-center">
      <div className="text-amber-400 text-4xl mb-4">⚠️</div>
      <div className="text-gray-300 text-lg">Database unavailable</div>
      <div className="text-gray-500 text-sm mt-2">Set DATABASE_URL to enable the knowledge hub</div>
    </div>
  );

  // Full article view
  if (readPost) return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => setReadPost(null)} className="text-amber-400 hover:text-amber-300 text-sm mb-6 flex items-center gap-1">
        ← Back to Articles
      </button>
      <div className={`text-xs px-2 py-1 rounded-full inline-block mb-3 ${CAT_COLORS[readPost.category] || 'text-gray-400 bg-gray-400/10'}`}>
        {readPost.category}
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">{readPost.title}</h1>
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 pb-4 border-b border-[#1e2a45]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-xs font-bold">
            {initials(readPost.author)}
          </div>
          <span>{readPost.author}</span>
        </div>
        <span>{new Date(readPost.created_at).toLocaleDateString()}</span>
        <span>{readPost.read_time_mins} min read</span>
        {readPost.ai_generated && <span className="text-purple-400">🤖 AI Generated</span>}
      </div>
      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{readPost.content}</div>
      {readPost.tags && (
        <div className="mt-6 pt-4 border-t border-[#1e2a45] flex flex-wrap gap-2">
          {readPost.tags.split(',').map(t => (
            <span key={t} className="text-xs text-gray-500 bg-[#1e2a45] px-2 py-1 rounded">{t.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">O&G Knowledge Hub</h1>
          <p className="text-gray-400 text-sm mt-1">Technical articles, industry news, lessons learned, and best practices</p>
        </div>
        <button onClick={() => setShowWrite(v => !v)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          + Write Article
        </button>
      </div>

      {/* Write Form */}
      {showWrite && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Write New Article</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Article Title *" required
                className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none">
                {['Technology', 'Safety', 'Regulatory', 'Operations', 'AI/ML', 'Industry News'].map(c =>
                  <option key={c}>{c}</option>)}
              </select>
              <input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                placeholder="Author Name"
                className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="Tags (comma-separated)"
                className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            </div>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder="Article content..."
              className="w-full bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none resize-none"
              rows={6} />
            <div className="flex gap-3 flex-wrap">
              <button type="submit" disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish Article'}
              </button>
              <button type="button" onClick={generateWithAI} disabled={generating || !form.title}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                {generating ? '🤖 Generating...' : '🤖 Generate with AI'}
              </button>
              <button type="button" onClick={() => setShowWrite(false)}
                className="border border-[#1e2a45] text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + category filter */}
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search articles..."
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

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : (
        <>
          {/* Featured article */}
          {featured && catFilter === 'All' && !search && (
            <div className="bg-[#0f1629] border border-amber-500/30 rounded-xl p-6 cursor-pointer hover:border-amber-500/60 transition-colors"
              onClick={() => setReadPost(featured)}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">⭐ Featured</span>
                <span className={`text-xs px-2 py-1 rounded-full ${CAT_COLORS[featured.category] || 'text-gray-400 bg-gray-400/10'}`}>
                  {featured.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{featured.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{excerpt(featured.content, 240)}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-xs font-bold">
                    {initials(featured.author)}
                  </div>
                  <span>{featured.author}</span>
                </div>
                <span>{new Date(featured.created_at).toLocaleDateString()}</span>
                <span>{featured.read_time_mins} min read</span>
                <span className="text-amber-400 hover:text-amber-300 ml-auto">Read More →</span>
              </div>
            </div>
          )}

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.filter(p => !(catFilter === 'All' && !search && p.featured)).map(post => (
              <div key={post.id}
                className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 cursor-pointer hover:border-amber-500/30 transition-colors flex flex-col"
                onClick={() => setReadPost(post)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${CAT_COLORS[post.category] || 'text-gray-400 bg-gray-400/10'}`}>
                    {post.category}
                  </span>
                  {post.ai_generated && <span className="text-xs text-purple-400">🤖</span>}
                </div>
                <h3 className="text-gray-200 font-semibold text-sm mb-2 leading-snug">{post.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-3">{excerpt(post.content, 120)}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-xs font-bold">
                      {initials(post.author)}
                    </div>
                    <span>{post.author.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{post.read_time_mins} min</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center text-gray-500 py-12">No articles found</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
