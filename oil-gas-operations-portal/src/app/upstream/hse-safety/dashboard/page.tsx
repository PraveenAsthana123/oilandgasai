'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashData {
  empty?: boolean; message?: string;
  kpis?: { total_incidents: string; avg_barrels: string; total_costs: string; top_cause: string; };
  causeDistribution?: { cause: string; cnt: string }[];
  topStates?: { state: string; cnt: string }[];
}

const COLORS = ['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total=data.reduce((s,d)=>s+d.value,0);
  if(total===0) return <div className="text-gray-500 text-xs text-center py-8">No data</div>;
  let cum=0;
  const slices=data.map(d=>{const a=(d.value/total)*360,s=cum;cum+=a;return{...d,s,a};});
  const xy=(cx:number,cy:number,r:number,deg:number)=>{const rad=(deg-90)*Math.PI/180;return[cx+r*Math.cos(rad),cy+r*Math.sin(rad)];};
  return(
    <svg viewBox="0 0 220 160" className="w-full h-40">
      {slices.map((s,i)=>{const[x1,y1]=xy(70,80,55,s.s),[x2,y2]=xy(70,80,55,s.s+s.a);return<path key={i} d={`M70,80 L${x1},${y1} A55,55 0 ${s.a>180?1:0},1 ${x2},${y2} Z`} fill={s.color} opacity={0.85} stroke="#0a0e1a" strokeWidth="1"/>;})}
      <g transform="translate(130,10)">{slices.map((s,i)=><g key={i} transform={`translate(0,${i*16})`}><rect width={8} height={8} fill={s.color} rx={1}/><text x={11} y={8} fill="#9ca3af" fontSize="8">{s.label.substring(0,18)}</text></g>)}</g>
    </svg>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max=Math.max(...data.map(d=>d.value),1);
  const w=220,h=120,pad=30,bw=Math.floor((w-pad*2)/Math.max(data.length,1))-2;
  return(
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      {data.map((d,i)=>{const bh=(d.value/max)*(h-pad-10),x=pad+i*(bw+2),y=h-pad-bh;return<g key={i}><rect x={x} y={y} width={bw} height={bh} fill="#ef4444" rx={2} opacity={0.8}/><text x={x+bw/2} y={h-4} textAnchor="middle" fill="#9ca3af" fontSize="6">{d.label.substring(0,7)}</text></g>;})}
      <line x1={pad} y1={10} x2={pad} y2={h-pad} stroke="#1e2a45"/><line x1={pad} y1={h-pad} x2={w-10} y2={h-pad} stroke="#1e2a45"/>
    </svg>
  );
}

export default function HseSafetyDashboardPage() {
  const [data, setData] = useState<DashData|null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(()=>{fetch('/api/upstream/hse-safety/dashboard').then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));},[]);

  if(loading) return <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-amber-400">Loading...</div>;
  if(!data||data.empty) return(
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-center"><p className="text-gray-400 mb-4">{data?.message??'No data imported yet. Import the pipeline accidents dataset first.'}</p>
        <button onClick={()=>router.push('/upstream/hse-safety/data')} className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg">Go to Data Import</button></div>
    </div>
  );

  const kpis=data.kpis!;
  const causePie=(data.causeDistribution??[]).map((c,i)=>({label:c.cause,value:parseInt(c.cnt),color:COLORS[i%COLORS.length]}));
  const stateBar=(data.topStates??[]).slice(0,8).map(s=>({label:s.state,value:parseInt(s.cnt)}));

  return(
    <div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">HSE & Safety — Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {label:'Total Incidents',value:parseInt(kpis.total_incidents||'0').toLocaleString(),unit:'incidents'},
            {label:'Avg Barrels Spilled',value:parseFloat(kpis.avg_barrels||'0').toFixed(1),unit:'barrels/incident'},
            {label:'Total Costs',value:`$${(parseFloat(kpis.total_costs||'0')/1e6).toFixed(1)}M`,unit:'estimated'},
            {label:'Top Incident Cause',value:kpis.top_cause||'N/A',unit:'by frequency'},
          ].map(k=>(
            <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{k.label}</p><p className="text-2xl font-bold text-amber-400 truncate">{k.value}</p><p className="text-xs text-gray-500">{k.unit}</p></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><h3 className="text-sm font-semibold text-white mb-3">Incident Cause Distribution</h3><PieChart data={causePie}/></div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><h3 className="text-sm font-semibold text-white mb-3">Top States by Incident Count</h3><BarChart data={stateBar}/></div>
        </div>
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Incident Causes Summary</h3>
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-[#1e2a45]">{['Cause','Count'].map(h=><th key={h} className="py-2 px-3 text-amber-400 text-left">{h}</th>)}</tr></thead>
          <tbody>{(data.causeDistribution??[]).map((c,i)=><tr key={i} className="border-b border-[#1e2a45]/50"><td className="py-2 px-3 text-white font-medium">{c.cause}</td><td className="py-2 px-3 text-amber-300">{parseInt(c.cnt).toLocaleString()}</td></tr>)}</tbody></table></div>
        </div>
      </div>
    </div>
  );
}
