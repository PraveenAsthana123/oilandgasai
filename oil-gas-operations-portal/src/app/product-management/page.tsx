'use client';
export default function ProductManagementPage() {
  const epics = [
    { epic: 'Core Operations Dashboards', stories: 8, done: 8, status: 'complete' },
    { epic: 'AI/ML Use Case Registry', stories: 5, done: 5, status: 'complete' },
    { epic: 'Digital Twin Hub', stories: 4, done: 4, status: 'complete' },
    { epic: 'IoT Sensor Network', stories: 3, done: 3, status: 'complete' },
    { epic: 'Computer Vision Center', stories: 4, done: 4, status: 'complete' },
    { epic: 'RAG Knowledge Base', stories: 3, done: 3, status: 'complete' },
    { epic: 'Agentic AI Dispatch', stories: 3, done: 3, status: 'complete' },
    { epic: 'Data Pipeline & Quality', stories: 5, done: 5, status: 'complete' },
    { epic: 'Noise Cleaning Models', stories: 2, done: 2, status: 'complete' },
    { epic: 'Statistical ML Models', stories: 3, done: 3, status: 'complete' },
    { epic: 'Real Ollama Integration', stories: 2, done: 2, status: 'complete' },
    { epic: 'Admin / Sales / Customer', stories: 6, done: 6, status: 'complete' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Product Management</h1>
        <p className="text-gray-400 text-sm mt-1">Roadmap · Feature backlog · User stories · Sprint board · Product metrics</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Epics', value: epics.length, color: 'text-amber-400' },
          { label: 'User Stories', value: epics.reduce((s, e) => s + e.stories, 0), color: 'text-blue-400' },
          { label: 'Completion', value: '100%', color: 'text-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-3">Epic Status Board</h2>
        <div className="space-y-2">
          {epics.map((e) => (
            <div key={e.epic} className="flex items-center gap-3 p-2 border border-[#1e2a45]/50 rounded-lg text-xs">
              <span className="flex-1 text-gray-300">{e.epic}</span>
              <span className="text-gray-500">{e.done}/{e.stories} stories</span>
              <div className="w-24 h-1.5 bg-[#1e2a45] rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(e.done / e.stories) * 100}%` }}></div>
              </div>
              <span className="text-green-400 text-xs">{e.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
