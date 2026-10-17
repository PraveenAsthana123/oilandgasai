'use client';
import { useEffect, useState } from 'react';
interface DataStatus { imported?: number; errors?: number; duration_ms?: number; error?: string; }
export default function ExplorationDataPage() {
  const [importStatus, setImportStatus] = useState<DataStatus | null>(null);
  const [importing, setImporting] = useState(false);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/upstream/exploration-geology/dashboard').then(r=>r.json()).then(d=>{if(!d.empty&&d.kpis)setDbCount(parseInt(d.kpis.total_readings));setLoading(false);}).catch(()=>setLoading(false)); }, [importStatus]);
  const runImport = async () => { setImporting(true); try{const r=await fetch('/api/upstream/exploration-geology/data/import',{method:'POST'});setImportStatus(await r.json());}catch(e:unknown){setImportStatus({error:String(e)});}setImporting(false); };
  const cols = ['Facies','Formation','Well_Name','Depth','GR','ILD_log10','DeltaPHI','PHIND','PE'];
  const sampleRows = [
    {Facies:3,Formation:'A1 SH',Well_Name:'SHRIMPLIN',Depth:2793,GR:77.45,ILD_log10:0.664,DeltaPHI:9.9,PHIND:11.915,PE:4.6},
    {Facies:3,Formation:'A1 SH',Well_Name:'SHRIMPLIN',Depth:2793.5,GR:78.26,ILD_log10:0.661,DeltaPHI:14.2,PHIND:12.565,PE:4.1},
    {Facies:3,Formation:'A1 SH',Well_Name:'SHRIMPLIN',Depth:2794,GR:79.05,ILD_log10:0.658,DeltaPHI:14.8,PHIND:13.05,PE:3.6},
    {Facies:3,Formation:'A1 SH',Well_Name:'SHANKLE',Depth:2650,GR:82.1,ILD_log10:0.55,DeltaPHI:11.2,PHIND:10.8,PE:3.9},
    {Facies:1,Formation:'A2 SS',Well_Name:'SHRIMPLIN',Depth:2810,GR:28.5,ILD_log10:1.24,DeltaPHI:2.1,PHIND:18.4,PE:2.1},
  ];
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Exploration Geology — Data Inventory</h1>
        <p className="text-gray-500 mb-6 text-sm">Kaggle dataset: Well Facies Classification | Well log data for geological interpretation</p>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">facies_data.csv</h2>
              <p className="text-xs text-gray-500 mb-2">Source: Kaggle — well-facies</p>
              <div className="mt-3 flex flex-wrap gap-2">{cols.map(c=><span key={c} className="text-xs bg-[#1e2a45] text-amber-300 px-2 py-0.5 rounded">{c}</span>)}</div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right"><div className="text-xs text-gray-500">DB rows imported</div><div className="text-2xl font-bold text-amber-400">{loading?'...':(dbCount??0).toLocaleString()}</div></div>
              <button onClick={runImport} disabled={importing} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">{importing?'Importing...':'Import to DB'}</button>
              {importStatus&&<div className={`text-xs px-3 py-1 rounded-full ${importStatus.error?'bg-red-900/30 text-red-400':'bg-green-900/30 text-green-400'}`}>{importStatus.error?`Error: ${importStatus.error}`:`Imported ${importStatus.imported} rows (${importStatus.duration_ms}ms)`}</div>}
            </div>
          </div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Data Preview (sample rows)</h2>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead><tr className="border-b border-[#1e2a45]">{cols.map(c=><th key={c} className="py-2 px-3 text-amber-400 font-semibold whitespace-nowrap">{c}</th>)}</tr></thead>
          <tbody>{sampleRows.map((row,i)=><tr key={i} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/30">{cols.map(c=><td key={c} className="py-2 px-3 text-gray-300 whitespace-nowrap">{String((row as Record<string,unknown>)[c]??'')}</td>)}</tr>)}</tbody></table></div>
          <p className="text-xs text-gray-500 mt-3">Facies codes: 1=Nonmarine sandstone, 2=Nonmarine coarse siltstone, 3=Nonmarine fine siltstone, 4=Marine siltstone, 5=Mudstone, 6=Wackestone, 7=Dolomite, 8=Packstone, 9=Phylloid algal</p>
        </div>
      </div>
    </div>
  );
}
