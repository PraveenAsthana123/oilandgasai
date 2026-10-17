'use client';
import { useEffect, useState } from 'react';
interface DataStatus { imported?:number;errors?:number;duration_ms?:number;error?:string; }
export default function WellIntegrityDataPage() {
  const [importStatus,setImportStatus]=useState<DataStatus|null>(null);
  const [importing,setImporting]=useState(false);
  const [dbCount,setDbCount]=useState<number|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{fetch('/api/upstream/well-integrity/dashboard').then(r=>r.json()).then(d=>{if(!d.empty&&d.kpis)setDbCount(parseInt(d.kpis.total_incidents));setLoading(false);}).catch(()=>setLoading(false));},[importStatus]);
  const runImport=async()=>{setImporting(true);try{setImportStatus(await(await fetch('/api/upstream/well-integrity/data/import',{method:'POST'})).json());}catch(e:unknown){setImportStatus({error:String(e)});}setImporting(false);};
  const cols=['Report_Number','Accident_Year','Operator_Name','State','Cause_Category','Net_Loss_Bbl','All_Injuries','All_Costs'];
  const sampleRows=[
    {Report_Number:'20100016',Accident_Year:2010,Operator_Name:'ONEOK NGL PIPELINE',State:'KS',Cause_Category:'INCORRECT OPERATION',Net_Loss_Bbl:21,All_Injuries:0,All_Costs:1627},
    {Report_Number:'20100254',Accident_Year:2010,Operator_Name:'PORTLAND PIPELINE CORP',State:'ME',Cause_Category:'MATERIAL/WELD/EQUIP FAILURE',Net_Loss_Bbl:0.12,All_Injuries:0,All_Costs:4008},
    {Report_Number:'20100387',Accident_Year:2010,Operator_Name:'SUNOCO PIPELINE',State:'TX',Cause_Category:'CORROSION',Net_Loss_Bbl:45,All_Injuries:0,All_Costs:85000},
    {Report_Number:'20110122',Accident_Year:2011,Operator_Name:'ENBRIDGE ENERGY',State:'MI',Cause_Category:'MATERIAL/WELD/EQUIP FAILURE',Net_Loss_Bbl:843000,All_Injuries:0,All_Costs:1200000000},
    {Report_Number:'20120045',Accident_Year:2012,Operator_Name:'PLAINS PIPELINE',State:'OK',Cause_Category:'NATURAL FORCE DAMAGE',Net_Loss_Bbl:126,All_Injuries:0,All_Costs:320000},
  ];
  return(
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Well Integrity — Data Inventory</h1>
        <p className="text-gray-500 mb-6 text-sm">Kaggle dataset: US Pipeline Accidents (PHMSA) | Incident reports, causes, volumes spilled</p>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div><h2 className="text-lg font-semibold text-white mb-1">database.csv (Pipeline Accidents)</h2><p className="text-xs text-gray-500 mb-2">Source: Kaggle — pipeline-accidents (PHMSA data)</p><div className="mt-3 flex flex-wrap gap-2">{cols.map(c=><span key={c} className="text-xs bg-[#1e2a45] text-amber-300 px-2 py-0.5 rounded">{c}</span>)}</div></div>
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
        </div>
      </div>
    </div>
  );
}
