'use client';
export default function BRDPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Business Requirements Document</h1>
        <p className="text-gray-400 text-sm mt-1">Requirements · Stakeholders · Scope in/out · MoSCoW · Acceptance criteria · Change log</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Project Scope', items: ['All 3 streams: Upstream, Midstream, Downstream', '60+ AI/ML use cases cataloged', 'Real-time IoT sensor integration', 'Digital twin management', 'RAG knowledge base', 'Agentic AI dispatch'] },
          { title: 'Stakeholders', items: ['Chief Digital Officer — sponsor', 'VP Operations — primary user', 'Data Science team — AI models', 'SCADA/IT — integration', 'HSE — safety use cases', 'Process Engineers — optimization'] },
          { title: 'Out of Scope', items: ['Direct SCADA control commands', 'Financial/SAP integration', 'Physical equipment procurement', 'Seismic acquisition hardware', 'Personnel HR management', 'ERP/supply chain systems'] },
        ].map((c) => (
          <div key={c.title} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="font-semibold text-white mb-3">{c.title}</div>
            <ul className="space-y-1">{c.items.map((i, idx) => <li key={idx} className="text-xs text-gray-400 flex items-start gap-2"><span className="text-amber-500 mt-0.5">›</span>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <div className="font-semibold text-white mb-3">MoSCoW Priority</div>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            { cat: 'Must Have', items: ['Use Case Registry (60+)', 'Upstream/Midstream/Downstream dashboards', 'IoT sensor display', 'Digital twin monitoring', 'RAG Q&A'], color: 'text-red-400 border-red-500/30' },
            { cat: 'Should Have', items: ['Agentic AI dispatch', 'Noise cleaning visualization', 'Statistical ML equations', 'Data quality monitoring'], color: 'text-amber-400 border-amber-500/30' },
            { cat: 'Could Have', items: ['Real Ollama integration', 'ChromaDB vector search', 'Admin role management', 'Customer portal'], color: 'text-blue-400 border-blue-500/30' },
            { cat: "Won't Have (v1)", items: ['Real-time SCADA write-back', 'Mobile app', 'Multi-tenancy', 'Historical backfill automation'], color: 'text-gray-400 border-gray-500/30' },
          ].map((c) => (
            <div key={c.cat} className={`border rounded-lg p-3 ${c.color}`}>
              <div className="font-medium mb-2">{c.cat}</div>
              <ul className="space-y-1">{c.items.map((i, idx) => <li key={idx} className="text-gray-400">{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
