'use client';
export default function ComputerVisionPage() {
  const models = [
    { name: 'YOLO v8 PPE Detector', task: 'Object Detection', domain: 'HSE/Safety', input: '1920×1080 CCTV frames', output: 'PPE item detections + violation alerts', accuracy: '96.2% mAP@0.5', status: 'deployed', cams: 48 },
    { name: 'EfficientDet Corrosion', task: 'Object Detection', domain: 'Pipeline Integrity', input: 'ILI/inspection images, drone footage', output: 'Corrosion bounding boxes, severity score', accuracy: '94.8% mAP@0.5', status: 'deployed', cams: 12 },
    { name: 'DeepLab v3 Flare Seg', task: 'Semantic Segmentation', domain: 'Environmental', input: 'Thermal camera frames, UV images', output: 'Flare plume mask, combustion area', accuracy: '91.4% mIoU', status: 'deployed', cams: 8 },
    { name: 'ResNet Defect Classifier', task: 'Image Classification', domain: 'Maintenance', input: 'Equipment inspection photos', output: 'Defect type, severity class 1-5', accuracy: '93.1% top-1', status: 'deployed', cams: 0 },
    { name: 'U-Net Crack Detection', task: 'Segmentation', domain: 'Structural Integrity', input: 'High-res surface images', output: 'Crack extent map, width/length estimate', accuracy: '89.6% mIoU', status: 'active', cams: 6 },
    { name: 'DnCNN Seismic Denoiser', task: 'Image Processing', domain: 'Exploration', input: 'Noisy seismic sections', output: 'Clean seismic, S/N improvement', accuracy: '28 dB PSNR', status: 'deployed', cams: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Computer Vision Center</h1>
        <p className="text-gray-400 text-sm mt-1">PPE detection · Corrosion detection · Crack detection · Flare analysis · Drone inspection</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Cameras Active', value: '48/52', icon: '📷' },
          { label: 'PPE Detections Today', value: '1,240', icon: '⛑️' },
          { label: 'Violations Today', value: '3', icon: '⚠️' },
          { label: 'Defects Found Today', value: '4', icon: '🔍' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{kpi.icon}</div>
            <div className="text-2xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.name} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-white text-sm">{m.name}</div>
              <span className={`text-xs px-2 py-0.5 rounded ${m.status === 'deployed' ? 'text-green-400 bg-green-500/10' : 'text-blue-400 bg-blue-500/10'}`}>{m.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-gray-500">Task:</span> <span className="text-amber-400">{m.task}</span></div>
              <div><span className="text-gray-500">Domain:</span> <span className="text-gray-300">{m.domain}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Input:</span> <span className="text-gray-400">{m.input}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Output:</span> <span className="text-gray-400">{m.output}</span></div>
              <div><span className="text-gray-500">Accuracy:</span> <span className="text-green-400 font-mono">{m.accuracy}</span></div>
              {m.cams > 0 && <div><span className="text-gray-500">Cameras:</span> <span className="text-blue-400">{m.cams}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
