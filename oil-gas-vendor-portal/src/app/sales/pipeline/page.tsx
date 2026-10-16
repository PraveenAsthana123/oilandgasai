'use client';
const STAGES = ['prospect', 'qualify', 'proposal', 'negotiation', 'closed'];
const opps = [
  { title: '3-Year Inspection Frame Agreement', value: 2500000, stage: 'proposal', probability: 60 },
  { title: 'Emergency Response Retainer', value: 750000, stage: 'negotiation', probability: 80 },
  { title: 'Digital Twin Implementation', value: 1200000, stage: 'qualify', probability: 30 },
  { title: 'Annual Maintenance Bundle', value: 950000, stage: 'prospect', probability: 20 },
];
export default function SalesPipelinePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
      <div className="grid grid-cols-5 gap-3">
        {STAGES.map((stage) => {
          const items = opps.filter((o) => o.stage === stage);
          return (
            <div key={stage} className="bg-[#0f1629] border border-[#1e2a45] rounded-lg p-3">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 capitalize">{stage}</div>
              {items.map((opp) => (
                <div key={opp.title} className="bg-[#1e2a45] rounded p-2 mb-2">
                  <div className="text-white text-xs font-medium mb-1">{opp.title}</div>
                  <div className="text-purple-400 text-xs">${(opp.value / 1000).toFixed(0)}K</div>
                  <div className="text-gray-500 text-xs">{opp.probability}% probability</div>
                </div>
              ))}
              {items.length === 0 && <div className="text-gray-600 text-xs text-center py-4">Empty</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
