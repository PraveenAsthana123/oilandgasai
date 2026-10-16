'use client';
import { useEffect, useState } from 'react';

interface QualityCert {
  id: number;
  delivery_id: number;
  product: string;
  delivery_product: string;
  volume: number;
  unit: string;
  delivery_date: string;
  company: string;
  api_gravity: number | null;
  sulphur_pct: number | null;
  btu_content: number | null;
  h2s_ppm: number | null;
  water_pct: number | null;
  spec_status: string;
}

function SpecBadge({ status }: { status: string }) {
  const cfg = {
    within_spec: 'bg-green-500/20 text-green-400 border-green-600/30',
    marginal: 'bg-amber-500/20 text-amber-400 border-amber-600/30',
    out_of_spec: 'bg-red-500/20 text-red-400 border-red-600/30',
  }[status] || 'bg-gray-500/20 text-gray-400 border-gray-600/30';
  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-medium ${cfg}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function QualityCertsPage() {
  const [certs, setCerts] = useState<QualityCert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quality-certs').then(r => r.json()).then(d => {
      setCerts(d.certs || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-blue-400">Loading quality certificates...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quality Certificates</h1>
        <p className="text-gray-400 mt-1">Assay reports and product specifications per batch</p>
      </div>

      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 text-sm text-gray-400">
        <div className="font-semibold text-gray-300 mb-2">Product Specification Reference</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-blue-400 text-xs font-semibold mb-1">Crude Oil — API Gravity</div>
            <div>Light: &gt;35° API | Medium: 25–35° | Heavy: &lt;25°</div>
            <div className="mt-1">Sweet: &lt;0.5% S | Sour: &gt;0.5% S</div>
          </div>
          <div>
            <div className="text-blue-400 text-xs font-semibold mb-1">Natural Gas</div>
            <div>BTU: 950–1050 typical | H₂S: &lt;4 ppm spec</div>
          </div>
          <div>
            <div className="text-blue-400 text-xs font-semibold mb-1">Refined Products</div>
            <div>Gasoline RON: 91–95 | Diesel Cetane: &gt;45</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {certs.map(cert => (
          <div key={cert.id} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-semibold">CERT-{String(cert.id).padStart(4, '0')} — {cert.delivery_product}</h3>
                  <SpecBadge status={cert.spec_status} />
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {cert.company} · {Number(cert.volume).toLocaleString()} {cert.unit} · {new Date(cert.delivery_date).toLocaleDateString('en-CA')}
                </div>
              </div>
              <button className="text-blue-400 text-sm border border-blue-600/40 px-3 py-1.5 rounded-lg hover:bg-blue-600/10">
                📄 Download PDF
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {cert.api_gravity !== null && (
                <div className="bg-[#0a0e1a] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">API Gravity</div>
                  <div className="text-white font-semibold">{cert.api_gravity}°</div>
                  <div className="text-xs text-gray-500">{Number(cert.api_gravity) > 35 ? 'Light' : Number(cert.api_gravity) > 25 ? 'Medium' : 'Heavy'}</div>
                </div>
              )}
              {cert.sulphur_pct !== null && (
                <div className="bg-[#0a0e1a] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Sulphur %</div>
                  <div className={`font-semibold ${Number(cert.sulphur_pct) < 0.5 ? 'text-green-400' : 'text-amber-400'}`}>{cert.sulphur_pct}%</div>
                  <div className="text-xs text-gray-500">{Number(cert.sulphur_pct) < 0.5 ? 'Sweet' : 'Sour'}</div>
                </div>
              )}
              {cert.btu_content !== null && (
                <div className="bg-[#0a0e1a] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">BTU Content</div>
                  <div className="text-white font-semibold">{cert.btu_content}</div>
                  <div className="text-xs text-gray-500">BTU/scf</div>
                </div>
              )}
              {cert.h2s_ppm !== null && (
                <div className="bg-[#0a0e1a] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">H₂S</div>
                  <div className={`font-semibold ${Number(cert.h2s_ppm) <= 4 ? 'text-green-400' : 'text-red-400'}`}>{cert.h2s_ppm} ppm</div>
                  <div className="text-xs text-gray-500">Spec: &lt;4 ppm</div>
                </div>
              )}
              {cert.water_pct !== null && (
                <div className="bg-[#0a0e1a] rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Water & Sediment</div>
                  <div className={`font-semibold ${Number(cert.water_pct) < 1 ? 'text-green-400' : 'text-amber-400'}`}>{cert.water_pct}%</div>
                  <div className="text-xs text-gray-500">BS&W</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
