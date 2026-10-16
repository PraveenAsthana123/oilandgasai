'use client';
import { useEffect, useState } from 'react';

interface Sensor {
  id: number;
  sensor_id: string;
  sensor_type: string;
  location: string;
  stream: string;
  unit: string;
  current_value: number;
  status: string;
  last_reading: string;
}

const STREAM_COLOR: Record<string, string> = {
  upstream: 'text-amber-400 bg-amber-500/10',
  midstream: 'text-blue-400 bg-blue-500/10',
  downstream: 'text-green-400 bg-green-500/10',
};

export default function IoTSensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? `?stream=${filter}` : '';
    fetch(`/api/sensors${params}`).then(r => r.json()).then(d => {
      setSensors(d.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filter]);

  const online = sensors.filter(s => s.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">IoT Sensor Network</h1>
          <p className="text-gray-400 text-sm mt-1">20,000+ sensors across all streams — Real-time telemetry, data quality monitoring</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">20,000+</div>
          <div className="text-xs text-gray-500">Total Sensors</div>
          <div className="text-xs text-green-400">99.2% online</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Pressure Sensors', count: 8200, pct: 99.1, icon: '📊' },
          { label: 'Temperature Sensors', count: 6800, pct: 99.5, icon: '🌡️' },
          { label: 'Flow Meters', count: 3200, pct: 98.8, icon: '💧' },
          { label: 'Vibration Sensors', count: 2400, pct: 98.2, icon: '📳' },
        ].map((t) => (
          <div key={t.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4">
            <div className="text-xl mb-2">{t.icon}</div>
            <div className="text-2xl font-bold text-white">{t.count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t.label}</div>
            <div className="text-xs text-green-400 mt-1">{t.pct}% online</div>
          </div>
        ))}
      </div>

      {/* Stream filter */}
      <div className="flex gap-2">
        {['', 'upstream', 'midstream', 'downstream'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400'}`}>
            {s || 'All Streams'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading sensors...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-[#1e2a45]">
                {['Sensor ID', 'Type', 'Location', 'Stream', 'Current Value', 'Unit', 'Status', 'Last Reading'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensors.map((s) => (
                <tr key={s.id} className="border-b border-[#1e2a45]/50 hover:bg-[#1e2a45]/20">
                  <td className="py-2 px-3 font-mono text-amber-400/80">{s.sensor_id}</td>
                  <td className="py-2 px-3 text-gray-300">{s.sensor_type}</td>
                  <td className="py-2 px-3 text-gray-400 max-w-[160px] truncate">{s.location}</td>
                  <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded text-xs ${STREAM_COLOR[s.stream] || ''}`}>{s.stream}</span></td>
                  <td className="py-2 px-3 text-white font-medium">{s.current_value}</td>
                  <td className="py-2 px-3 text-gray-400">{s.unit}</td>
                  <td className="py-2 px-3"><span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-xs">{s.status}</span></td>
                  <td className="py-2 px-3 text-gray-500">{s.last_reading ? new Date(s.last_reading).toLocaleTimeString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-gray-600 text-right">Showing {sensors.length} sensors from DB. Full network: 20,000+ sensors.</div>
    </div>
  );
}
