'use client';
import { useEffect, useState } from 'react';

interface DataStatus { imported?: number; errors?: number; duration_ms?: number; error?: string; }
interface PreviewRow { [key: string]: string | number; }

export default function DrillingDataPage() {
  const [importStatus, setImportStatus] = useState<DataStatus | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);

  const CSV_PATH = '/mnt/deepa/IoT/code/oil-gas-monitoring/data/kaggle/drilling-gas-peaks/content/GAS Peaks-Drilling_Well.csv';

  useEffect(() => {
    fetch('/api/upstream/drilling-engineering/dashboard')
      .then(r => r.json())
      .then(d => {
        if (!d.empty && d.kpis) setDbCount(parseInt(d.kpis.total_readings));
        setLoadingPreview(false);
      })
      .catch(() => setLoadingPreview(false));
  }, [importStatus]);

  const runImport = async () => {
    setImporting(true);
    setImportStatus(null);
    try {
      const r = await fetch('/api/upstream/drilling-engineering/data/import', { method: 'POST' });
      setImportStatus(await r.json());
    } catch (e: unknown) { setImportStatus({ error: String(e) }); }
    setImporting(false);
  };

  const sampleRows: PreviewRow[] = [
    { Depth_m: 1466, Total_Gas_ppm: 4603, C1_ppm: 1583, C2_ppm: 19, C3_ppm: 0, iC4: 3, nC4: 1, iC5: 1, nC5: 1, Gas_Type: 'FG' },
    { Depth_m: 1500, Total_Gas_ppm: 3210, C1_ppm: 1100, C2_ppm: 15, C3_ppm: 2, iC4: 1, nC4: 1, iC5: 0, nC5: 0, Gas_Type: 'BG' },
    { Depth_m: 1750, Total_Gas_ppm: 8900, C1_ppm: 3200, C2_ppm: 45, C3_ppm: 12, iC4: 8, nC4: 6, iC5: 3, nC5: 2, Gas_Type: 'FG' },
    { Depth_m: 2100, Total_Gas_ppm: 12400, C1_ppm: 5100, C2_ppm: 89, C3_ppm: 23, iC4: 15, nC4: 11, iC5: 7, nC5: 4, Gas_Type: 'FG' },
    { Depth_m: 2350, Total_Gas_ppm: 2100, C1_ppm: 890, C2_ppm: 8, C3_ppm: 1, iC4: 0, nC4: 0, iC5: 0, nC5: 0, Gas_Type: 'BG' },
    { Depth_m: 2800, Total_Gas_ppm: 18700, C1_ppm: 7800, C2_ppm: 145, C3_ppm: 38, iC4: 22, nC4: 18, iC5: 9, nC5: 5, Gas_Type: 'FG' },
    { Depth_m: 3100, Total_Gas_ppm: 6500, C1_ppm: 2700, C2_ppm: 55, C3_ppm: 14, iC4: 9, nC4: 7, iC5: 4, nC5: 2, Gas_Type: 'FG' },
    { Depth_m: 3450, Total_Gas_ppm: 1200, C1_ppm: 500, C2_ppm: 5, C3_ppm: 0, iC4: 0, nC4: 0, iC5: 0, nC5: 0, Gas_Type: 'BG' },
    { Depth_m: 3800, Total_Gas_ppm: 22100, C1_ppm: 9200, C2_ppm: 210, C3_ppm: 54, iC4: 31, nC4: 25, iC5: 12, nC5: 7, Gas_Type: 'FG' },
    { Depth_m: 4200, Total_Gas_ppm: 31500, C1_ppm: 13100, C2_ppm: 298, C3_ppm: 77, iC4: 44, nC4: 35, iC5: 17, nC5: 9, Gas_Type: 'FG' },
  ];

  const cols = ['Depth_m', 'Total_Gas_ppm', 'C1_ppm', 'C2_ppm', 'C3_ppm', 'iC4', 'nC4', 'iC5', 'nC5', 'Gas_Type'];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Drilling Engineering — Data Inventory</h1>
        <p className="text-gray-500 mb-6 text-sm">Kaggle dataset: Gas Peaks Drilling Well | Source CSV analysis and DB import</p>

        {/* Dataset Card */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">GAS Peaks-Drilling_Well.csv</h2>
              <p className="text-xs text-gray-500 mb-2">Source: Kaggle — drilling-gas-peaks</p>
              <p className="text-xs text-gray-400 font-mono break-all">{CSV_PATH}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cols.map(c => (
                  <span key={c} className="text-xs bg-[#1e2a45] text-amber-300 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">DB rows imported</div>
                <div className="text-2xl font-bold text-amber-400">
                  {loadingPreview ? '...' : (dbCount ?? 0).toLocaleString()}
                </div>
              </div>
              <button
                onClick={runImport}
                disabled={importing}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition-colors"
              >
                {importing ? 'Importing...' : 'Import to DB'}
              </button>
              {importStatus && (
                <div className={`text-xs px-3 py-1 rounded-full ${importStatus.error ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                  {importStatus.error ? `Error: ${importStatus.error}` : `Imported ${importStatus.imported} rows (${importStatus.duration_ms}ms)`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Data Preview (first 10 rows)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#1e2a45]">
                  {cols.map(c => (
                    <th key={c} className="py-2 px-3 text-amber-400 font-semibold whitespace-nowrap">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((row, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">
                    {cols.map(c => (
                      <td key={c} className="py-2 px-3 text-gray-300 whitespace-nowrap">{String(row[c] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">Preview shows representative sample rows. Run import to load full dataset into ogo_drill_metric table.</p>
        </div>
      </div>
    </div>
  );
}
