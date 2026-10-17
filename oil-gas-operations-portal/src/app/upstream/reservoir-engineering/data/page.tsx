'use client';
import { useEffect, useState } from 'react';

interface DataStatus { imported?: number; errors?: number; duration_ms?: number; error?: string; }

export default function ReservoirDataPage() {
  const [importStatus, setImportStatus] = useState<DataStatus | null>(null);
  const [importing, setImporting] = useState(false);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/upstream/reservoir-engineering/dashboard')
      .then(r => r.json())
      .then(d => { if (!d.empty && d.kpis) setDbCount(parseInt(d.kpis.total_reservoirs)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [importStatus]);

  const runImport = async () => {
    setImporting(true);
    try { const r = await fetch('/api/upstream/reservoir-engineering/data/import', { method: 'POST' }); setImportStatus(await r.json()); }
    catch (e: unknown) { setImportStatus({ error: String(e) }); }
    setImporting(false);
  };

  const cols = ['Reservoir_Name','Basin_Region','Location','Proven_Reserves_Billion_Barrels','Production_Capacity_Barrels_Day','Oil_Type_Grade','Status','Year_Discovered'];
  const sampleRows = [
    { Reservoir_Name: 'Orinoco Belt', Basin_Region: 'Orinoco Belt', Location: 'Eastern Venezuela', Proven_Reserves_Billion_Barrels: 235, Production_Capacity_Barrels_Day: 400000, Oil_Type_Grade: 'Extra Heavy Crude', Status: 'Active', Year_Discovered: 2007 },
    { Reservoir_Name: 'Ghawar Field', Basin_Region: 'Arabian Basin', Location: 'Eastern Saudi Arabia', Proven_Reserves_Billion_Barrels: 75, Production_Capacity_Barrels_Day: 5000000, Oil_Type_Grade: 'Light Sweet Crude', Status: 'Active', Year_Discovered: 1948 },
    { Reservoir_Name: 'Safaniya', Basin_Region: 'Arabian Gulf', Location: 'Saudi Arabia Offshore', Proven_Reserves_Billion_Barrels: 37, Production_Capacity_Barrels_Day: 1500000, Oil_Type_Grade: 'Light Crude', Status: 'Active', Year_Discovered: 1951 },
    { Reservoir_Name: 'Rumaila', Basin_Region: 'Mesopotamian Basin', Location: 'Southern Iraq', Proven_Reserves_Billion_Barrels: 17, Production_Capacity_Barrels_Day: 1400000, Oil_Type_Grade: 'Medium Crude', Status: 'Active', Year_Discovered: 1953 },
    { Reservoir_Name: 'Carabobo-2 North', Basin_Region: 'Orinoco Belt', Location: 'Carabobo State', Proven_Reserves_Billion_Barrels: 6.5, Production_Capacity_Barrels_Day: 400000, Oil_Type_Grade: 'Extra Heavy Crude', Status: 'Development', Year_Discovered: 2010 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Reservoir Engineering — Data Inventory</h1>
        <p className="text-gray-500 mb-6 text-sm">Kaggle dataset: Global Reservoir Inventory | Basin, reserves, production capacity data</p>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Reservoir_NameBasin_RegionLocatio.csv</h2>
              <p className="text-xs text-gray-500 mb-2">Source: Kaggle — reservoir-inventory</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cols.map(c => <span key={c} className="text-xs bg-[#1e2a45] text-amber-300 px-2 py-0.5 rounded">{c}</span>)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">DB rows imported</div>
                <div className="text-2xl font-bold text-amber-400">{loading ? '...' : (dbCount ?? 0).toLocaleString()}</div>
              </div>
              <button onClick={runImport} disabled={importing} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">
                {importing ? 'Importing...' : 'Import to DB'}
              </button>
              {importStatus && <div className={`text-xs px-3 py-1 rounded-full ${importStatus.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>{importStatus.error ? `Error: ${importStatus.error}` : `Imported ${importStatus.imported} rows (${importStatus.duration_ms}ms)`}</div>}
            </div>
          </div>
        </div>

        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Data Preview (representative rows)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead><tr className="border-b border-[#1e2a45]">
                {cols.map(c => <th key={c} className="py-2 px-3 text-amber-400 font-semibold whitespace-nowrap">{c}</th>)}
              </tr></thead>
              <tbody>
                {sampleRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                    {cols.map(c => <td key={c} className="py-2 px-3 text-gray-300 whitespace-nowrap">{String((row as Record<string,unknown>)[c] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
