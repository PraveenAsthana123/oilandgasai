'use client';
import { useState, useEffect, useCallback } from 'react';
interface DataStatus { rows?: number; error?: string; }
interface ImportResult { success?: boolean; inserted?: number; skipped?: number; total?: number; error?: string; }

export default function QualityDataPage() {
  const [status, setStatus] = useState<DataStatus | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fetchStatus = useCallback(async () => { const r = await fetch('/api/downstream/quality-control/data/import'); setStatus(await r.json()); }, []);
  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  const handleImport = async () => { setImporting(true); setResult(null); const r = await fetch('/api/downstream/quality-control/data/import', { method: 'POST' }); setResult(await r.json()); setImporting(false); fetchStatus(); };

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Quality Control</span></div>
          <h1 className="text-3xl font-bold text-amber-300">Dataset Management</h1>
          <p className="text-gray-400 mt-1">Well facies petrophysical properties as crude quality proxy (GR, PE, PHIND) with computed quality score.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[{label:'Source Dataset',value:'facies_data.csv',sub:'Well Facies'},{label:'Rows Loaded',value:status?.rows!==undefined?status.rows.toLocaleString():'—',sub:'In ogo_quality_metric'},{label:'Quality Score',value:'0-1',sub:'Computed from GR + PHIND'}].map(c=>(
            <div key={c.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-amber-300 text-xl font-bold">{c.value}</p>
              <p className="text-gray-500 text-xs mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6 mb-6">
          <h2 className="text-amber-400 font-semibold mb-4">Column Schema — ogo_quality_metric</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 border-b border-gray-800">{['Column','Type','Description'].map(h=><th key={h} className="text-left py-2 pr-6 font-medium">{h}</th>)}</tr></thead>
              <tbody className="text-gray-300">
                {[['well_name','TEXT','Well identifier'],['formation','TEXT','Geological formation'],['gr','NUMERIC','Gamma Ray (API) — lower=better quality'],['pe','NUMERIC','Photoelectric factor — lithology indicator'],['phind','NUMERIC','Porosity % — higher=better reservoir'],['quality_score','NUMERIC','Computed 0-1 quality index'],['imported_at','TIMESTAMPTZ','Import timestamp']].map(r=>(
                  <tr key={r[0]} className="border-b border-gray-800/50">{r.map((v,i)=><td key={i} className="py-2 pr-6 font-mono text-xs">{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-amber-400 font-semibold">Import Data</h2><p className="text-gray-500 text-sm mt-1">Load up to 5,000 records with auto-computed quality scores.</p></div>
            <button onClick={handleImport} disabled={importing} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg">{importing ? 'Importing…' : 'Import to DB'}</button>
          </div>
          {result && <div className={`rounded-lg p-4 text-sm ${result.error ? 'bg-red-900/30 border border-red-700 text-red-300' : 'bg-green-900/30 border border-green-700 text-green-300'}`}>{result.error ? `Error: ${result.error}` : `Imported ${result.inserted?.toLocaleString()} rows (${result.skipped} skipped)`}</div>}
          {(status?.rows ?? 0) === 0 && !importing && <div className="mt-4 rounded-lg border border-dashed border-amber-800/50 p-8 text-center text-gray-500"><p className="text-2xl mb-2">🧪</p><p>No data loaded yet. Click <strong className="text-amber-400">Import to DB</strong>.</p></div>}
          {(status?.rows ?? 0) > 0 && <div className="mt-4 rounded-lg bg-gray-800/50 p-4 text-center text-gray-400 text-sm">✓ {status?.rows?.toLocaleString()} rows in <span className="text-amber-400 font-mono">ogo_quality_metric</span></div>}
        </div>
      </div>
    </div>
  );
}
