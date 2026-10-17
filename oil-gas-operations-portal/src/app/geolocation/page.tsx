'use client';
import { useEffect, useState } from 'react';

type GeoAsset = {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  status: string;
  dept: string;
  last_inspection: string | null;
  created_at: string;
};

type Kpis = {
  total: number;
  producing_wells: number;
  active_pipelines: number;
  active_facilities: number;
};

const TYPE_FILTERS = ['All', 'well', 'pipeline', 'facility'];

// Map projection constants — Western Canada bounding box
// lat: 50..58°N  lon: -120..-108°W
const MAP_W = 700;
const MAP_H = 440;
const LAT_MIN = 50, LAT_MAX = 58;
const LON_MIN = -121, LON_MAX = -108;

function projectLon(lon: number) {
  return ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W;
}
function projectLat(lat: number) {
  // SVG y increases downward, lat increases upward
  return MAP_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * MAP_H;
}

const WELL_STATUS_COLOR: Record<string, string> = {
  producing: '#22c55e',
  injection: '#f59e0b',
  abandoned: '#ef4444',
};

export default function GeolocationPage() {
  const [assets, setAssets] = useState<GeoAsset[]>([]);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbDown, setDbDown] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState<GeoAsset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'well', lat: '', lon: '', status: 'active', dept: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/geolocation');
      const d = await r.json();
      if (d._mock) { setDbDown(true); return; }
      setAssets(d.data || []);
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
    setSaving(true);
    try {
      await fetch('/api/geolocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lat: parseFloat(form.lat), lon: parseFloat(form.lon) }),
      });
      setForm({ name: '', type: 'well', lat: '', lon: '', status: 'active', dept: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  const filtered = assets.filter(a => typeFilter === 'All' || a.type === typeFilter);
  const wells = filtered.filter(a => a.type === 'well');
  const pipelines = filtered.filter(a => a.type === 'pipeline');
  const facilities = filtered.filter(a => a.type === 'facility');

  if (dbDown) return (
    <div className="p-8 text-center">
      <div className="text-amber-400 text-4xl mb-4">⚠️</div>
      <div className="text-gray-300 text-lg">Database unavailable</div>
      <div className="text-gray-500 text-sm mt-2">Set DATABASE_URL to enable geo asset mapping</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Asset Geo-Visualization</h1>
          <p className="text-gray-400 text-sm mt-1">Well locations, pipeline routes, and facility sites — Western Canadian Sedimentary Basin</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          + Add Asset
        </button>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Assets Mapped', value: kpis.total, icon: '📍' },
            { label: 'Producing Wells', value: kpis.producing_wells, icon: '🟢' },
            { label: 'Active Pipelines', value: kpis.active_pipelines, icon: '〰️' },
            { label: 'Active Facilities', value: kpis.active_facilities, icon: '🏭' },
          ].map(k => (
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{k.value}</div>
              <div className="text-xs text-gray-400">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-2">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              typeFilter === t ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-gray-200'
            }`}>{t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}</button>
        ))}
      </div>

      {/* Map */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-300 text-sm font-medium">Western Canada — WCSB Overview</div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Producing</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Injection</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Abandoned</span>
            <span className="flex items-center gap-1"><span className="w-4 h-1 bg-blue-400 inline-block"></span> Pipeline</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-500 inline-block"></span> Facility</span>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <svg width={MAP_W} height={MAP_H} viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="w-full max-w-full" style={{ background: '#0a0e1a', borderRadius: '8px' }}>
            {/* Alberta outline (simplified polygon) */}
            <polygon
              points="200,20 420,20 430,60 440,200 445,380 420,420 180,420 160,380 155,200 165,60"
              fill="#1e2a45" fillOpacity="0.4" stroke="#2d3f5e" strokeWidth="1.5" />
            {/* BC partial */}
            <polygon
              points="30,30 200,20 165,60 155,200 120,220 80,240 40,260 20,200 10,100"
              fill="#1a2535" fillOpacity="0.4" stroke="#2d3f5e" strokeWidth="1" />
            {/* Saskatchewan partial */}
            <polygon
              points="420,20 620,20 630,60 640,200 645,380 620,420 420,420 445,380 440,200 430,60"
              fill="#1a2535" fillOpacity="0.4" stroke="#2d3f5e" strokeWidth="1" />

            {/* Grid lines */}
            {[52, 54, 56].map(lat => (
              <g key={lat}>
                <line x1="0" y1={projectLat(lat)} x2={MAP_W} y2={projectLat(lat)}
                  stroke="#1e2a45" strokeWidth="0.5" strokeDasharray="4,4" />
                <text x="4" y={projectLat(lat) - 3} fill="#374151" fontSize="9">{lat}°N</text>
              </g>
            ))}
            {[-116, -113, -110].map(lon => (
              <g key={lon}>
                <line x1={projectLon(lon)} y1="0" x2={projectLon(lon)} y2={MAP_H}
                  stroke="#1e2a45" strokeWidth="0.5" strokeDasharray="4,4" />
                <text x={projectLon(lon) + 2} y={MAP_H - 4} fill="#374151" fontSize="9">{Math.abs(lon)}°W</text>
              </g>
            ))}

            {/* Province labels */}
            <text x="240" y={MAP_H / 2} fill="#4b5563" fontSize="16" fontWeight="bold" textAnchor="middle" opacity="0.6">ALBERTA</text>
            <text x="100" y={MAP_H / 2 - 40} fill="#374151" fontSize="11" textAnchor="middle" opacity="0.6">B.C.</text>
            <text x="540" y={MAP_H / 2 + 20} fill="#374151" fontSize="11" textAnchor="middle" opacity="0.6">SASK.</text>

            {/* Pipeline lines */}
            {pipelines.map(p => {
              const x = projectLon(p.lon);
              const y = projectLat(p.lat);
              return (
                <g key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                  <line x1={x - 25} y1={y} x2={x + 25} y2={y}
                    stroke="#60a5fa" strokeWidth="3" strokeOpacity="0.7" />
                  <circle cx={x} cy={y} r={5} fill="#60a5fa" fillOpacity="0.3" stroke="#60a5fa" strokeWidth="1"
                    className={selected?.id === p.id ? 'stroke-white stroke-2' : ''} />
                </g>
              );
            })}

            {/* Facility squares */}
            {facilities.map(f => {
              const x = projectLon(f.lon);
              const y = projectLat(f.lat);
              return (
                <rect key={f.id} x={x - 6} y={y - 6} width={12} height={12}
                  fill="#a855f7" fillOpacity="0.8" stroke={selected?.id === f.id ? '#fff' : '#c084fc'}
                  strokeWidth={selected?.id === f.id ? 2 : 1}
                  className="cursor-pointer" onClick={() => setSelected(f)} />
              );
            })}

            {/* Well circles */}
            {wells.map(w => {
              const x = projectLon(w.lon);
              const y = projectLat(w.lat);
              const color = WELL_STATUS_COLOR[w.status] || '#9ca3af';
              return (
                <circle key={w.id} cx={x} cy={y} r={7}
                  fill={color} fillOpacity="0.8"
                  stroke={selected?.id === w.id ? '#fff' : color}
                  strokeWidth={selected?.id === w.id ? 2.5 : 1}
                  className="cursor-pointer" onClick={() => setSelected(w)} />
              );
            })}
          </svg>
        </div>

        {/* Selected asset detail */}
        {selected && (
          <div className="mt-4 bg-[#0a0e1a] border border-[#1e2a45] rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-semibold">{selected.name}</div>
                <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                  <div>Type: <span className="text-amber-400 capitalize">{selected.type}</span></div>
                  <div>Status: <span className="text-green-400 capitalize">{selected.status}</span></div>
                  <div>Department: {selected.dept}</div>
                  <div>Coordinates: {Number(selected.lat).toFixed(3)}°N, {Math.abs(Number(selected.lon)).toFixed(3)}°W</div>
                  {selected.last_inspection && <div>Last Inspection: {new Date(selected.last_inspection).toLocaleDateString()}</div>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Form */}
      {showForm && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Add New Asset</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Asset Name *" required
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none">
              <option value="well">Well</option>
              <option value="pipeline">Pipeline</option>
              <option value="facility">Facility</option>
            </select>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none">
              <option value="producing">Producing</option>
              <option value="injection">Injection</option>
              <option value="active">Active</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <input value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))}
              placeholder="Latitude (e.g. 53.02)" type="number" step="0.001"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <input value={form.lon} onChange={e => setForm(p => ({ ...p, lon: e.target.value }))}
              placeholder="Longitude (e.g. -114.98)" type="number" step="0.001"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <input value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}
              placeholder="Department"
              className="bg-[#0a0e1a] border border-[#1e2a45] rounded-lg px-3 py-2 text-gray-300 text-sm focus:border-amber-500 outline-none" />
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Asset'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-[#1e2a45] text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assets table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2a45]">
          <div className="text-gray-300 text-sm font-medium">Asset Registry ({filtered.length} assets)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2a45]">
                {['Name', 'Type', 'Latitude', 'Longitude', 'Status', 'Dept', 'Last Inspection'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}
                  className={`border-b border-[#1e2a45]/50 cursor-pointer transition-colors ${selected?.id === a.id ? 'bg-amber-500/10' : 'hover:bg-[#1e2a45]/20'}`}
                  onClick={() => setSelected(selected?.id === a.id ? null : a)}>
                  <td className="px-4 py-3 text-gray-300 text-xs">{a.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      a.type === 'well' ? 'text-green-400 bg-green-400/10' :
                      a.type === 'pipeline' ? 'text-blue-400 bg-blue-400/10' :
                      'text-purple-400 bg-purple-400/10'
                    }`}>{a.type}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{Number(a.lat).toFixed(3)}°N</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{Math.abs(Number(a.lon)).toFixed(3)}°W</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      a.status === 'producing' || a.status === 'active' ? 'text-green-400 bg-green-400/10' :
                      a.status === 'injection' ? 'text-amber-400 bg-amber-400/10' :
                      'text-red-400 bg-red-400/10'
                    }`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{a.dept}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {a.last_inspection ? new Date(a.last_inspection).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
