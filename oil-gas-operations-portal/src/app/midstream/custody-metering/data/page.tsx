'use client';
import { useEffect, useState } from 'react';

interface ImportStatus { status: string; rows?: number; error?: string; }

export default function CustodyMeteringDataPage() {
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch('/api/midstream/custody-metering/data/import').then(r => r.json())
      .then(d => { setImportStatus(d); setPreview(d.preview ?? []); }).catch(() => {});
  }, []);

  const runImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/midstream/custody-metering/data/import', { method: 'POST' });
      const d = await res.json(); setImportStatus(d); setPreview(d.preview ?? []);
    } finally { setImporting(false); }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Custody Metering — Dataset</h1>
        <p className="text-gray-400 text-sm mt-1">Kaggle: production-trends/OGORBcsv_cleaned.csv → ogo_metering_metric</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Production Trends (Metering)', file: 'production-trends/content/OGORBcsv_cleaned.csv', cols: 'Production_Date, Commodity, Volume, State', table: 'ogo_metering_metric' },
          { label: 'Metering Use', file: 'Volume reconciliation by commodity/state', cols: 'Custody transfer verification, mass balance, settlement calculations', table: 'Reconciliation & audit trail' },
        ].map((ds) => (
          <div key={ds.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xs text-amber-400 font-semibold mb-2">DATASET</div>
            <div className="text-white font-semibold mb-1">{ds.label}</div>
            <div className="text-xs text-gray-500 mb-2">{ds.file}</div>
            <div className="text-xs text-gray-400 mb-2">Cols: {ds.cols}</div>
            <div className="text-xs text-gray-500">→ {ds.table}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">DB Import Status</div>
          {importStatus ? (
            <div className="text-sm mt-1">
              <span className={importStatus.status === 'ok' ? 'text-green-400' : 'text-amber-400'}>
                {importStatus.status === 'ok' ? `✓ ${importStatus.rows?.toLocaleString()} rows in ogo_metering_metric` : importStatus.status}
              </span>
              {importStatus.error && <span className="text-red-400 ml-2">{importStatus.error}</span>}
            </div>
          ) : <div className="text-gray-500 text-sm mt-1">Checking…</div>}
        </div>
        <button onClick={runImport} disabled={importing}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold px-4 py-2 rounded-lg text-sm">
          {importing ? 'Importing…' : 'Import to DB'}
        </button>
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Data Preview (first 10 rows)</h2>
        {preview.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">No data yet. Click <span className="text-amber-400">Import to DB</span>.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-300">
              <thead><tr className="border-b border-[#1e2a45]">{Object.keys(preview[0]).map(k => <th key={k} className="text-left py-2 pr-4 text-amber-400 font-semibold">{k}</th>)}</tr></thead>
              <tbody>{preview.map((row, i) => (<tr key={i} className="border-b border-[#1e2a45]/30">{Object.values(row).map((v, j) => <td key={j} className="py-1.5 pr-4 text-gray-400">{String(v ?? '—')}</td>)}</tr>))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
