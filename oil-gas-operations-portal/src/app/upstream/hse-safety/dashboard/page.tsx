'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
interface DashData { empty?:boolean;message?:string;kpis?:{total_incidents:string;high_severity_count:string;total_cost_million:string;total_fatalities:string;};severityDistribution?:{severity:string;cnt:string}[];incidentTrend?:{accident_year:string;incidents:string}[];causeDistribution?:{cause_category:string;cnt:string}[]; }
const SEV_COLORS:Record<string,string>={'CRITICAL':'#ef4444','HIGH':'#f97316','MEDIUM':'#f59e0b','LOW':'#10b981'};
const COLORS=['#f59e0b','#3b82f6','#10b981','#ef4444','#8b5cf6','#06b6d4'];
function PieChart({data}:{data:{label:string;value:number;color:string}[]}){
  const total=data.reduce((s,d)=>s+d.value,0);if(total===0)return<div className="text-gray-500 text-xs text-center py-8">No data</div>;
  let cum=0;const slices=data.map(d=>{const a=(d.value/total)*360,s=cum;cum+=a;return{...d,s,a};});
  const xy=(cx:number,cy:number,r:number,deg:number)=>{const rad=(deg-90)*Math.PI/180;return[cx+r*Math.cos(rad),cy+r*Math.sin(rad)];};
  return(<svg viewBox="0 0 200 160" className="w-full h-40">{slices.map((s,i)=>{const[x1,y1]=xy(70,80,55,s.s),[x2,y2]=xy(70,80,55,s.s+s.a);return<path key={i} d={`M70,80 L${x1},${y1} A55,55 0 ${s.a>180?1:0},1 ${x2},${y2} Z`} fill={s.color} opacity={0.85} stroke="#0a0e1a" strokeWidth="1"/>;})}
    <g transform="translate(130,20)">{slices.map((s,i)=><g key={i} transform={`translate(0,${i*20})`}><rect width={10} height={10} fill={s.color} rx={2}/><text x={14} y={9} fill="#9ca3af" fontSize="9">{s.label}</text></g>)}</g></svg>);
}
function LineChart({data}:{data:{label:string;value:number}[]}){
  if(data.length<2)return<div className="text-gray-500 text-xs text-center py-8">Insufficient data</div>;
  const max=Math.max(...data.map(d=>d.value),1);const w=220,h=100,pad=20;
  const pts=data.map((d,i)=>{const x=pad+(i/(data.length-1))*(w-pad*2),y=pad+(1-d.value/max)*(h-pad*2);return`${x},${y}`;}).join(' ');
  return(<svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28"><polyline points={pts} fill="none" stroke="#ef4444" strokeWidth="2"/>{data.map((d,i)=>{const x=pad+(i/(data.length-1))*(w-pad*2),y=pad+(1-d.value/max)*(h-pad*2);return<circle key={i} cx={x} cy={y} r={2.5} fill="#ef4444"/>;})}
    <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#1e2a45"/><line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#1e2a45"/></svg>);
}
function BarChart({data}:{data:{label:string;value:number}[]}){
  const max=Math.max(...data.map(d=>d.value),1);const w=220,h=120,pad=30,bw=Math.floor((w-pad*2)/data.length)-2;
  return(<svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">{data.map((d,i)=>{const bh=(d.value/max)*(h-pad-10),x=pad+i*(bw+2),y=h-pad-bh;return<g key={i}><rect x={x} y={y} width={bw} height={bh} fill="#ef4444" rx={2} opacity={0.8}/><text x={x+bw/2} y={h-4} textAnchor="middle" fill="#9ca3af" fontSize="6">{d.label.substring(0,10)}</text></g>;})}
    <line x1={pad} y1={10} x2={pad} y2={h-pad} stroke="#1e2a45"/><line x1={pad} y1={h-pad} x2={w-10} y2={h-pad} stroke="#1e2a45"/></svg>);
}
export default function HSEDashboardPage(){
  const [data,setData]=useState<DashData|null>(null);const [loading,setLoading]=useState(true);const router=useRouter();
  useEffect(()=>{fetch('/api/upstream/hse-safety/dashboard').then(r=>r.json()).then(d=>{setData(d);setLoading(false);}).catch(()=>setLoading(false));},[]);
  if(loading)return<div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center text-amber-400">Loading...</div>;
  if(!data||data.empty)return(<div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center"><div className="text-center"><p className="text-gray-400 mb-4">{data?.message??'No data'}</p><button onClick={()=>router.push('/upstream/hse-safety/jobs')} className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg">Run Import Job</button></div></div>);
  const kpis=data.kpis!;
  const sevPie=(data.severityDistribution??[]).map(s=>({label:s.severity,value:parseInt(s.cnt),color:SEV_COLORS[s.severity]??'#9ca3af'}));
  const trendLine=(data.incidentTrend??[]).map(t=>({label:String(t.accident_year),value:parseInt(t.incidents)}));
  const causeBar=(data.causeDistribution??[]).map((c,i)=>({label:c.cause_category,value:parseInt(c.cnt),color:COLORS[i%COLORS.length]}));
  return(<div className="min-h-screen bg-[#0a0e1a] text-gray-300 p-6"><div className="max-w-6xl mx-auto">
    <h1 className="text-2xl font-bold text-amber-400 mb-6">HSE Safety — Dashboard</h1>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[{label:'Total Incidents',value:parseInt(kpis.total_incidents).toLocaleString(),unit:'incidents',c:'text-amber-400'},{label:'High Severity',value:parseInt(kpis.high_severity_count||'0').toLocaleString(),unit:'CRITICAL+HIGH',c:'text-red-400'},{label:'Total Cost',value:`$${parseFloat(kpis.total_cost_million||'0').toLocaleString()}M`,unit:'USD million',c:'text-amber-400'},{label:'Total Fatalities',value:kpis.total_fatalities||'0',unit:'fatalities',c:'text-red-400'}].map(k=>(
        <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">{k.label}</p><p className={`text-2xl font-bold ${k.c}`}>{k.value}</p><p className="text-xs text-gray-500">{k.unit}</p></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><h3 className="text-sm font-semibold text-white mb-3">Severity Distribution</h3><PieChart data={sevPie}/></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><h3 className="text-sm font-semibold text-white mb-3">Incident Trend by Year</h3><LineChart data={trendLine}/></div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4"><h3 className="text-sm font-semibold text-white mb-3">Incidents by Cause</h3><BarChart data={causeBar}/></div>
    </div>
  </div></div>);
}
