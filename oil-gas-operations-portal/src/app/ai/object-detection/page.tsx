'use client';
export default function ObjectDetectionPage() {
  const detectors = [
    { name: 'YOLO v8 PPE Detector', objects: ['Hard hat', 'Safety vest', 'Safety glasses', 'Gloves', 'Safety boots', 'Fall arrest harness'], fps: '30 fps (1080p)', mAP: '96.2% mAP@0.5', domain: 'HSE/Safety' },
    { name: 'EfficientDet Equipment', objects: ['Valve', 'Flange', 'Pipe fitting', 'Instrument', 'Expansion joint', 'Support clamp'], fps: '12 fps (4K drone)', mAP: '92.4% mAP@0.5', domain: 'Inspection' },
    { name: 'YOLO v8 Hazard Zones', objects: ['Exclusion zone', 'Dropped object risk', 'Spill zone', 'Fire/explosion zone', 'Worker in zone', 'Vehicle intrusion'], fps: '25 fps', mAP: '94.1% mAP@0.5', domain: 'Safety' },
    { name: 'Faster R-CNN Defect', objects: ['Crack', 'Corrosion', 'Dent', 'Gouge', 'Weld defect', 'Coating holiday'], fps: '5 fps (high-res)', mAP: '91.8% mAP@0.5', domain: 'Pipeline/Vessel' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Object Detection</h1>
        <p className="text-gray-400 text-sm mt-1">Worker detection · PPE items · Equipment components · Hazard zones — YOLO, EfficientDet</p></div>
      {detectors.map((d) => (
        <div key={d.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white text-sm">{d.name}</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-blue-400">{d.fps}</span>
              <span className="text-green-400 font-mono">{d.mAP}</span>
              <span className="text-amber-400/70">{d.domain}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {d.objects.map((o, i) => (
              <span key={i} className="px-2 py-1 bg-[#1e2a45] text-gray-300 text-xs rounded">{o}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
