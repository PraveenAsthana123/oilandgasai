'use client';
export default function ImageClassificationPage() {
  const classes = [
    { task: 'Equipment Status', classes: ['Operational', 'Degraded', 'Failed', 'Under Maintenance'], model: 'ResNet-50', acc: '93.1%', domain: 'All streams' },
    { task: 'Defect Type', classes: ['Corrosion (Surface)', 'Corrosion (Pitting)', 'Crack', 'Deformation', 'Coating Loss'], model: 'EfficientNet-B4', acc: '91.8%', domain: 'Pipeline, Vessels' },
    { task: 'Severity Score', classes: ['Level 1 (Minor)', 'Level 2 (Moderate)', 'Level 3 (Significant)', 'Level 4 (Critical)', 'Level 5 (Emergency)'], model: 'VGG-16', acc: '89.4%', domain: 'All inspection types' },
    { task: 'Seismic Facies', classes: ['Channel', 'Mound', 'Drape', 'Onlap', 'Truncation'], model: 'CNN + Attention', acc: '87.2%', domain: 'Exploration' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Image Classification</h1>
        <p className="text-gray-400 text-sm mt-1">Equipment status · Defect type · Severity scoring — CNN classifiers</p></div>
      {classes.map((c) => (
        <div key={c.task} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">{c.task} Classification</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-blue-400 font-mono">{c.model}</span>
              <span className="text-green-400 font-mono">{c.acc} acc</span>
              <span className="text-gray-500">{c.domain}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.classes.map((cls, i) => (
              <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-full">{cls}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
