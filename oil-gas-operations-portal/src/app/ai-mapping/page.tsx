'use client';

const aiMapping = [
  { process: 'Seismic Acquisition', subProcess: 'Shot gather processing', aiType: 'Deep Learning', model: 'U-Net / DnCNN', status: 'deployed', stream: 'upstream' },
  { process: 'Reservoir Management', subProcess: 'Decline curve fitting', aiType: 'Statistical ML', model: 'Arps / Bayesian', status: 'deployed', stream: 'upstream' },
  { process: 'Drilling Operations', subProcess: 'ROP optimization', aiType: 'Reinforcement Learning', model: 'PPO Agent', status: 'deployed', stream: 'upstream' },
  { process: 'Drilling Operations', subProcess: 'Stuck pipe prediction', aiType: 'ML Classification', model: 'LSTM / Random Forest', status: 'deployed', stream: 'upstream' },
  { process: 'Production', subProcess: 'ESP monitoring', aiType: 'Anomaly Detection', model: 'LSTM Autoencoder', status: 'deployed', stream: 'upstream' },
  { process: 'Production', subProcess: 'Production forecasting', aiType: 'Time Series', model: 'LSTM / TFT', status: 'deployed', stream: 'upstream' },
  { process: 'Pipeline Integrity', subProcess: 'Leak detection', aiType: 'Statistical ML + IoT', model: 'SPC + LSTM', status: 'deployed', stream: 'midstream' },
  { process: 'Pipeline Integrity', subProcess: 'ILI defect classification', aiType: 'Computer Vision', model: 'ResNet / EfficientNet', status: 'deployed', stream: 'midstream' },
  { process: 'Compression', subProcess: 'Predictive maintenance', aiType: 'ML + FFT', model: 'RF + LSTM AE', status: 'deployed', stream: 'midstream' },
  { process: 'SCADA', subProcess: 'Anomaly detection', aiType: 'Deep Learning', model: 'LSTM Autoencoder', status: 'deployed', stream: 'midstream' },
  { process: 'Refinery', subProcess: 'Crude blending', aiType: 'LP + ML', model: 'CPLEX + XGBoost', status: 'deployed', stream: 'downstream' },
  { process: 'Refinery', subProcess: 'Distillation optimization', aiType: 'Digital Twin + ML', model: 'MPC + Neural', status: 'deployed', stream: 'downstream' },
  { process: 'Product Quality', subProcess: 'Spec prediction', aiType: 'Soft Sensor ML', model: 'PLS + NN', status: 'deployed', stream: 'downstream' },
  { process: 'Environmental', subProcess: 'Flare monitoring', aiType: 'Computer Vision Seg', model: 'DeepLab v3', status: 'deployed', stream: 'downstream' },
  { process: 'HSE/Safety', subProcess: 'PPE detection', aiType: 'Object Detection', model: 'YOLO v8', status: 'deployed', stream: 'cross-cutting' },
  { process: 'Knowledge Mgmt', subProcess: 'Technical Q&A', aiType: 'RAG + LLM', model: 'llama3.2 + ChromaDB', status: 'deployed', stream: 'cross-cutting' },
  { process: 'Digital Operations', subProcess: 'Document intelligence', aiType: 'NLP + RAG', model: 'LLM + sentence-xfm', status: 'deployed', stream: 'cross-cutting' },
  { process: 'Autonomous Ops', subProcess: 'Inspection agent', aiType: 'Agentic AI', model: 'llama3.2 agent', status: 'active', stream: 'cross-cutting' },
];

const STREAM_COLOR: Record<string, string> = {
  upstream: 'text-amber-400 bg-amber-500/10',
  midstream: 'text-blue-400 bg-blue-500/10',
  downstream: 'text-green-400 bg-green-500/10',
  'cross-cutting': 'text-purple-400 bg-purple-500/10',
};

const STATUS_COLOR: Record<string, string> = {
  deployed: 'text-green-400 bg-green-500/10',
  active: 'text-blue-400 bg-blue-500/10',
  planned: 'text-amber-400 bg-amber-500/10',
};

const AI_TYPE_GROUPS = [
  { group: 'Computer Vision', types: ['Computer Vision', 'Object Detection', 'CV Segmentation', 'Image Classification'], color: 'text-pink-400 bg-pink-500/10', icon: '👁️' },
  { group: 'Deep Learning', types: ['Deep Learning', 'Time Series', 'Anomaly Detection'], color: 'text-blue-400 bg-blue-500/10', icon: '🧠' },
  { group: 'Statistical ML', types: ['Statistical ML', 'Statistical ML + IoT', 'ML Classification', 'Soft Sensor ML'], color: 'text-amber-400 bg-amber-500/10', icon: '📊' },
  { group: 'Optimization', types: ['LP + ML', 'Reinforcement Learning', 'Digital Twin + ML'], color: 'text-green-400 bg-green-500/10', icon: '⚡' },
  { group: 'NLP / RAG', types: ['RAG + LLM', 'NLP + RAG', 'Agentic AI'], color: 'text-purple-400 bg-purple-500/10', icon: '💬' },
];

export default function AIMappingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Technology Mapping</h1>
        <p className="text-gray-400 text-sm mt-1">Core Process → Sub-Process → AI Type → Model → Status across all streams</p>
      </div>

      {/* AI type groups */}
      <div className="grid grid-cols-5 gap-3">
        {AI_TYPE_GROUPS.map((g) => (
          <div key={g.group} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-3">
            <div className="text-xl mb-2">{g.icon}</div>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded inline-block mb-2 ${g.color}`}>{g.group}</div>
            <div className="text-xs text-gray-500">{aiMapping.filter(m => g.types.some(t => m.aiType.includes(t.split(' ')[0]))).length} use cases</div>
          </div>
        ))}
      </div>

      {/* Mapping table */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e2a45]">
          <h2 className="font-semibold text-white">Process → AI Technology Mapping Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1e2a45] bg-[#0a0e1a]">
                <th className="text-left py-2 px-3 font-medium">Core Process</th>
                <th className="text-left py-2 px-3 font-medium">Sub-Process</th>
                <th className="text-left py-2 px-3 font-medium">Stream</th>
                <th className="text-left py-2 px-3 font-medium">AI Type</th>
                <th className="text-left py-2 px-3 font-medium">Model / Algorithm</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {aiMapping.map((row, i) => (
                <tr key={i} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20 transition-colors">
                  <td className="py-2 px-3 text-white font-medium">{row.process}</td>
                  <td className="py-2 px-3 text-gray-300">{row.subProcess}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${STREAM_COLOR[row.stream]}`}>{row.stream}</span>
                  </td>
                  <td className="py-2 px-3 text-amber-400/80">{row.aiType}</td>
                  <td className="py-2 px-3 text-blue-400/80 font-mono">{row.model}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOR[row.status]}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technology taxonomy */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
        <h2 className="font-semibold text-white mb-4">Technology Architecture Layers</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { layer: 'Data Ingestion', items: ['IoT/SCADA sensors', 'Lab LIMS systems', 'Seismic acquisition', 'Drone/camera feeds'], icon: '📡' },
            { layer: 'Processing', items: ['Signal denoising', 'Feature engineering', 'Normalization', 'Data quality validation'], icon: '⚙️' },
            { layer: 'AI/ML Models', items: ['Deep learning (CNN, LSTM)', 'Statistical ML (RF, XGBoost)', 'Physics-ML hybrid', 'Reinforcement learning'], icon: '🧠' },
            { layer: 'Output / Action', items: ['Digital twin updates', 'Operator alerts', 'Autonomous control', 'Business reporting'], icon: '📊' },
          ].map((l) => (
            <div key={l.layer} className="border border-[#1e2a45] rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span>{l.icon}</span>
                <span className="text-sm font-medium text-white">{l.layer}</span>
              </div>
              <ul className="space-y-1">
                {l.items.map((item, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                    <span className="text-amber-500 mt-0.5">›</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
