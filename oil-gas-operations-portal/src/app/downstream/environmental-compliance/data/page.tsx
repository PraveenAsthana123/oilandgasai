'use client';
import { useState, useEffect, useCallback } from 'react';
interface DataStatus { methane_rows?: number; spill_rows?: number; error?: string; }
interface ImportResult { success?: boolean; inserted?: number; skipped?: number; total?: number; error?: string; dataset?: string; }

export default function EnviroDataPage() {
  const [status, setStatus] = useState<DataStatus | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fetchStatus = useCallback(async () => { setStatus(await (await fetch('/api/downstream/environmental-compliance/data/import')).json()); }, []);
  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  const handleImport = async (dataset: string) => {
    setImporting(dataset); setResult(null);
    setResult(await (await fetch('/api/downstream/environmental-compliance/data/import', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ dataset }) })).json());
    setImporting(null); fetchStatus();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8"><div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-amber-400 text-sm font-mono uppercase tracking-widest">Downstream / Environmental Compliance</span></div><h1 className="text-3xl font-bold text-amber-300">Dataset Management</h1><p className="text-gray-400 mt-1">Two datasets: methane historical emissions (1990-2018) and oil spill incidents.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[{label:'Methane Rows',value:status?.methane_rows!==undefined?status.methane_rows.toLocaleString():'—',sub:'In ogo_enviro_metric'},{label:'Spill Rows',value:status?.spill_rows!==undefined?status.spill_rows.toLocaleString():'—',sub:'In ogo_spill_metric'},{label:'Methane Dataset',value:'methane_hist_emissions',sub:'Countries, Sectors 1990-2018'},{label:'Spill Dataset',value:'Oil spillage dataset',sub:'Vessel, Location, Tonnes'}].map(c=>(
            <div key={c.label} className="bg-gray-900 border border-amber-900/40 rounded-xl p-5"><p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{c.label}</p><p className="text-amber-300 text-xl font-bold">{c.value}</p><p className="text-gray-500 text-xs mt-1">{c.sub}</p></div>
          ))}
        </div>

        {/* Schema tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
            <h2 className="text-amber-400 font-semibold mb-3 text-sm">ogo_enviro_metric (Methane)</h2>
            <div className="space-y-1">{[['country','Country identifier'],['sector','Emission sector'],['gas','Gas type (CH4, N2O)'],['unit','Measurement unit'],['year','Year (1990-2018)'],['value','Emission value']].map(r=><div key={r[0]} className="flex gap-3 text-xs"><span className="text-amber-500 font-mono w-20">{r[0]}</span><span className="text-gray-400">{r[1]}</span></div>)}</div>
          </div>
          <div className="bg-gray-900 border border-amber-900/40 rounded-xl p-5">
            <h2 className="text-amber-400 font-semibold mb-3 text-sm">ogo_spill_metric (Oil Spills)</h2>
            <div className="space-y-1">{[['vessel','Ship/vessel name'],['location','Incident location'],['incident_date','Date of spill'],['min_tonnes','Minimum spill (tonnes)'],['max_tonnes','Maximum spill (tonnes)'],['owner','Vessel owner']].map(r=><div key={r[0]} className="flex gap-3 text-xs"><span className="text-amber-500 font-mono w-28">{r[0]}</span><span className="text-gray-400">{r[1]}</span></div>)}</div>
          </div>
        </div>

        {/* Import buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['methane','spill'] as const).map(ds=>(
            <div key={ds} className="bg-gray-900 border border-amber-900/40 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div><h2 className="text-amber-400 font-semibold">{ds === 'methane' ? 'Methane Emissions' : 'Oil Spill Incidents'}</h2><p className="text-gray-500 text-sm mt-1">{ds === 'methane' ? 'Up to 20K×29-year rows' : 'All spill records'}</p></div>
                <button onClick={()=>handleImport(ds)} disabled={importing!==null} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg text-sm">{importing===ds ? 'Importing…' : 'Import'}</button>
              </div>
              {result?.dataset===ds && <div className={`rounded-lg p-3 text-sm ${result.error ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-green-900/30 text-green-300 border border-green-700'}`}>{result.error ? `Error: ${result.error}` : `Imported ${result.inserted?.toLocaleString()} rows`}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
