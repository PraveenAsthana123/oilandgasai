'use client';
export default function DataTypesPage() {
  const types = [
    { category: 'Sensor / IoT (Structured)', icon: '📡', types: [
      { name: 'Pressure', format: 'FLOAT32', freq: '1 Hz', source: 'SCADA PT transmitters', count: '8,200' },
      { name: 'Temperature', format: 'FLOAT32', freq: '1 Hz', source: 'SCADA TT transmitters', count: '6,800' },
      { name: 'Flow Rate', format: 'FLOAT32', freq: '0.1 Hz', source: 'Flow computers, FT', count: '3,200' },
      { name: 'Vibration', format: 'FLOAT64 spectrum', freq: '10 kHz', source: 'Accelerometers', count: '2,400' },
    ]},
    { category: 'Images (Unstructured)', icon: '📸', types: [
      { name: 'CCTV Frames', format: 'JPEG/H.264', freq: '25 fps', source: 'IP cameras', count: '52 feeds' },
      { name: 'Drone Inspection', format: 'TIFF 4K', freq: 'Per mission', source: 'Autonomous drone', count: '24 missions/yr' },
      { name: 'Thermal IR', format: 'TIFF 16-bit', freq: '10 fps', source: 'FLIR cameras', count: '18 cameras' },
      { name: 'Seismic Sections', format: 'SEG-Y', freq: 'Acquisition cycle', source: 'Seismic acquisition', count: '1,200 km²' },
    ]},
    { category: 'Documents (Unstructured)', icon: '📄', types: [
      { name: 'Maintenance Reports', format: 'PDF/DOCX', freq: 'Per event', source: 'SAP PM system', count: '12,000/yr' },
      { name: 'Lab LIMS Reports', format: 'PDF/CSV', freq: '4× daily', source: 'Laboratory LIMS', count: '50,000/yr' },
      { name: 'Regulatory Submissions', format: 'XML/PDF', freq: 'Monthly', source: 'Compliance team', count: '200/yr' },
      { name: 'P&IDs', format: 'DWG/SVG', freq: 'Per revision', source: 'Engineering', count: '4,500 drawings' },
    ]},
    { category: 'Production (Structured)', icon: '⛽', types: [
      { name: 'Daily Production', format: 'CSV/DB table', freq: 'Daily', source: 'Production allocation', count: '42 wells' },
      { name: 'Well Tests', format: 'CSV/DB table', freq: 'Monthly', source: 'Test separator', count: '504/yr' },
      { name: 'PVT Fluid Data', format: 'EOS model', freq: 'Per sample', source: 'Lab fluid analysis', count: '120/yr' },
      { name: 'Reservoir Pressure', format: 'FLOAT64', freq: 'Weekly', source: 'BHP gauges, MDT', count: '85 wells' },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Data Types Registry</h1>
        <p className="text-gray-400 text-sm mt-1">Sensor types · Image types · Document types · Structured/Unstructured classification</p></div>
      {types.map((g) => (
        <div key={g.category} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">{g.icon} {g.category}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-[#1e2a45]">
                  {['Data Type', 'Format', 'Frequency', 'Source System', 'Volume'].map(h => (
                    <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.types.map((t) => (
                  <tr key={t.name} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20">
                    <td className="py-2 px-2 text-white font-medium">{t.name}</td>
                    <td className="py-2 px-2 font-mono text-amber-400/80">{t.format}</td>
                    <td className="py-2 px-2 text-gray-300">{t.freq}</td>
                    <td className="py-2 px-2 text-gray-400">{t.source}</td>
                    <td className="py-2 px-2 text-blue-400">{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
