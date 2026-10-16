'use client';
export default function SegmentationPage() {
  const models = [
    { name: 'DeepLab v3 Flare', task: 'Flare plume segmentation', classes: ['Background', 'Flame body', 'Smoke plume', 'Heat shimmer'], iou: '91.4%', application: 'Emission volume estimation from thermal cameras' },
    { name: 'U-Net Corrosion Area', task: 'Corrosion extent mapping', classes: ['Clean metal', 'Surface corrosion', 'Pitting corrosion', 'Through-corrosion'], iou: '88.2%', application: 'ILI defect area quantification for integrity assessment' },
    { name: 'Mask R-CNN Crack', task: 'Crack extent segmentation', classes: ['Background', 'Hairline crack', 'Structural crack', 'Propagating crack'], iou: '86.7%', application: 'Structural integrity assessment of risers and pressure vessels' },
    { name: 'SegNet Leak Plume', task: 'Leak detection plume', classes: ['Background', 'Gas cloud', 'Liquid spill', 'Foam/froth'], iou: '84.1%', application: 'Gas cloud extent from hyperspectral and IR cameras' },
    { name: 'PSPNet Seismic', task: 'Seismic facies segmentation', classes: ['Horizon', 'Fault', 'Salt body', 'Gas chimney', 'Channel fill'], iou: '79.8%', application: '3D seismic interpretation volume segmentation' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Image Segmentation</h1>
        <p className="text-gray-400 text-sm mt-1">Corrosion area mapping · Crack extent · Leak plume · Flare shape — U-Net, DeepLab, Mask R-CNN</p></div>
      <div className="grid grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-white text-sm">{m.name}</div>
              <span className="text-green-400 font-mono text-xs">{m.iou} mIoU</span>
            </div>
            <div className="text-xs text-amber-400/80 mb-2">{m.task}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {m.classes.map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#1e2a45] text-gray-400 text-xs rounded">{c}</span>
              ))}
            </div>
            <div className="text-xs text-gray-500 border-t border-[#1e2a45] pt-2">{m.application}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
