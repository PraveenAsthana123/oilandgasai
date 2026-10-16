'use client';
export default function MLPage() {
  const models = [
    { category: 'Regression', models: ['XGBoost (corrosion rate)', 'Gradient Boosting (product quality)', 'Random Forest (reservoir permeability)', 'Linear Regression (pressure decline)'], icon: '📈' },
    { category: 'Classification', models: ['Random Forest (stuck pipe risk)', 'SVM (formation lithology)', 'Neural Network (defect severity)', 'LSTM (alarm classification)'], icon: '🏷️' },
    { category: 'Clustering', models: ['K-Means (alarm grouping)', 'DBSCAN (anomaly isolation)', 'Hierarchical (production well clusters)', 'GMM (sensor behavior profiles)'], icon: '🗂️' },
    { category: 'Time Series', models: ['LSTM (production forecast)', 'TFT (price forecast)', 'SARIMA (demand planning)', 'Prophet (maintenance scheduling)'], icon: '📅' },
    { category: 'Anomaly Detection', models: ['Isolation Forest (SCADA)', 'LSTM Autoencoder (ESP)', 'One-Class SVM (sensor drift)', 'Statistical SPC (KPI monitoring)'], icon: '🔍' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">ML Models Registry</h1>
        <p className="text-gray-400 text-sm mt-1">Regression · Classification · Clustering · Time Series · Anomaly Detection</p></div>
      <div className="grid grid-cols-5 gap-4">
        {[{ v: '47', l: 'Models in Production', c: 'text-amber-400' }, { v: '12', l: 'In Development', c: 'text-blue-400' },
          { v: '94.2%', l: 'Avg Accuracy', c: 'text-green-400' }, { v: '3', l: 'Retraining Today', c: 'text-purple-400' },
          { v: '0', l: 'Failed Predictions', c: 'text-green-400' }].map(k => (
          <div key={k.l} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
            <div className="text-xs text-gray-500 mt-1">{k.l}</div>
          </div>
        ))}
      </div>
      {models.map((g) => (
        <div key={g.category} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
          <h2 className="font-semibold text-white mb-3">{g.icon} {g.category}</h2>
          <div className="grid grid-cols-2 gap-2">
            {g.models.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs border border-[#1e2a45] rounded px-3 py-2">
                <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                <span className="text-gray-300">{m}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
