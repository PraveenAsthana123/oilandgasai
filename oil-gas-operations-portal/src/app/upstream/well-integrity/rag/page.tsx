'use client';
import { useEffect, useState } from 'react';
interface Chunk { id:number;content:string;source_doc:string;created_at:string;relevance_score?:number; }
export default function WellIntegrityRagPage() {
  const [chunks,setChunks]=useState<Chunk[]>([]);const [seeding,setSeeding]=useState(false);const [seedResult,setSeedResult]=useState<{chunks_created?:number}|null>(null);
  const [queryText,setQueryText]=useState('');const [queryResults,setQueryResults]=useState<Chunk[]>([]);const [querying,setQuerying]=useState(false);const [loading,setLoading]=useState(true);
  const fetch_=async()=>{try{const d=await(await fetch('/api/upstream/well-integrity/rag/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'pipeline integrity corrosion barrier'})})).json();setChunks(d.chunks??[]);}catch{/**/}setLoading(false);};
  useEffect(()=>{fetch_();},[seedResult]);
  const seed=async()=>{setSeeding(true);try{setSeedResult(await(await fetch('/api/upstream/well-integrity/rag/seed',{method:'POST'})).json());}catch{/**/}setSeeding(false);};
  const qry=async()=>{if(!queryText.trim())return;setQuerying(true);try{setQueryResults(((await(await fetch('/api/upstream/well-integrity/rag/query',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:queryText})})).json()).chunks)??[]);}catch{/**/}setQuerying(false);};
  return(<div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6"><div className="max-w-5xl mx-auto">
    <h1 className="text-2xl font-bold text-amber-400 mb-2">Well Integrity — Vector DB (RAG)</h1>
    <p className="text-gray-500 mb-6 text-sm">Knowledge base for AI-assisted integrity management queries</p>
    <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
      <div><div className="flex items-center gap-3"><div className="text-3xl font-bold text-amber-400">{loading?'...':chunks.length}</div><div><p className="text-sm text-white font-medium">Chunks in Vector DB</p><p className="text-xs text-gray-500">dept: well-integrity | Table: ogo_rag_chunk</p></div></div><p className="text-xs text-gray-500 mt-2">Embedding model: <span className="text-amber-300">nomic-embed-text (via Ollama)</span></p></div>
      <div className="flex flex-col items-end gap-2"><button onClick={seed} disabled={seeding} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">{seeding?'Seeding...':'Seed Vector DB'}</button>{seedResult&&<p className="text-xs text-green-400">Created {seedResult.chunks_created} chunks</p>}</div>
    </div>
    <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 mb-6"><h2 className="text-base font-semibold text-white mb-3">Query Test</h2>
      <div className="flex gap-3 mb-4"><input value={queryText} onChange={e=>setQueryText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&qry()} placeholder="Search integrity knowledge chunks..." className="flex-1 bg-[#1e2a45] border border-[#2a3a5a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500"/><button onClick={qry} disabled={querying||!queryText.trim()} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-semibold rounded-lg text-sm">{querying?'Searching...':'Search'}</button></div>
      {queryResults.length>0&&<div className="space-y-3">{queryResults.map((c,i)=><div key={i} className="bg-[#1e2a45]/30 border border-[#2a3a5a] rounded-lg p-3"><div className="flex justify-between mb-1"><span className="text-xs text-amber-400">Chunk #{c.id} · {c.source_doc}</span>{c.relevance_score&&<span className="text-xs text-green-400">Score: {c.relevance_score}</span>}</div><p className="text-xs text-gray-300">{c.content}</p></div>)}</div>}
    </div>
    <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5"><h2 className="text-base font-semibold text-white mb-4">Stored Chunks</h2>
      {chunks.length===0?<div className="text-center py-8"><p className="text-gray-500 text-sm mb-3">No chunks yet.</p><button onClick={seed} disabled={seeding} className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm">Seed Vector DB</button></div>:(
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-[#1e2a45]">{['ID','Content Preview','Source','Created'].map(h=><th key={h} className="py-2 px-3 text-amber-400 text-left">{h}</th>)}</tr></thead><tbody>{chunks.map((c,i)=><tr key={i} className="border-b border-[#1e2a45]/50"><td className="py-2 px-3 text-gray-500">{c.id}</td><td className="py-2 px-3 text-gray-300 max-w-xs truncate">{c.content?.substring(0,80)}...</td><td className="py-2 px-3 text-amber-300">{c.source_doc}</td><td className="py-2 px-3 text-gray-500">{c.created_at?new Date(c.created_at).toLocaleDateString():'-'}</td></tr>)}</tbody></table></div>
      )}
    </div>
  </div></div>);
}
