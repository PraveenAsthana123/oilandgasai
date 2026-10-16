'use client';

import { useState } from 'react';
import Link from 'next/link';

type Department = 'Petrophysics' | 'Reservoir' | 'Drilling' | 'Seismic' | 'Economics';
type OrgType = 'Equinor' | 'Agile Scientific' | 'Academic' | 'Community';

interface Library {
  slug: string;
  name: string;
  stars: number | null;
  org: OrgType;
  description: string;
  capabilities: string[];
  departments: Department[];
  github: string;
  language: string;
}

const ORG_COLORS: Record<OrgType, string> = {
  'Equinor': 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  'Agile Scientific': 'bg-green-900/50 text-green-300 border border-green-700/50',
  'Academic': 'bg-gray-700/50 text-gray-300 border border-gray-600/50',
  'Community': 'bg-orange-900/50 text-orange-300 border border-orange-700/50',
};

const DEPT_COLORS: Record<Department, string> = {
  'Petrophysics': 'bg-purple-900/40 text-purple-300',
  'Reservoir': 'bg-amber-900/40 text-amber-300',
  'Drilling': 'bg-red-900/40 text-red-300',
  'Seismic': 'bg-cyan-900/40 text-cyan-300',
  'Economics': 'bg-emerald-900/40 text-emerald-300',
};

const LIBRARIES: Library[] = [
  {
    slug: 'lasio',
    name: 'lasio',
    stars: 404,
    org: 'Community',
    description: 'Industry-standard Python library for reading and writing LAS (Log ASCII Standard) well log files. Supports LAS 1.2, 2.0, and 3.0 formats with full curve mnemonic handling.',
    capabilities: [
      'Parse LAS 1.2 / 2.0 / 3.0 well log files with full header preservation',
      'Read/write GR, RHOB, NPHI, DT, RT, CALI and all standard curve mnemonics',
      'Depth-step validation, unit conversion, and null-value handling',
    ],
    departments: ['Petrophysics', 'Drilling'],
    github: 'github.com/kinverarity1/lasio',
    language: 'Python',
  },
  {
    slug: 'welly',
    name: 'welly',
    stars: 376,
    org: 'Agile Scientific',
    description: 'Data science toolkit for well log analysis. Provides a Well object model with QC, normalization, correlation, and synthetic log generation capabilities built on NumPy/pandas.',
    capabilities: [
      'Well object model with multi-curve container, header, and location metadata',
      'QC methods: despiking, normalization, depth-shift, and log correlation',
      'Synthetic log generation and well-to-well curve correlation',
    ],
    departments: ['Petrophysics', 'Reservoir'],
    github: 'github.com/agilescientific/welly',
    language: 'Python',
  },
  {
    slug: 'bruges',
    name: 'bruges',
    stars: 318,
    org: 'Agile Scientific',
    description: 'Bag of geoscience equations covering seismic rock physics, AVO, wavelets, and modelling. Provides Aki-Richards, Zoeppritz, Gassmann, Backus, and wedge model implementations.',
    capabilities: [
      'Aki-Richards and full Zoeppritz reflection coefficient equations',
      'Gassmann fluid substitution: Ksat = Kdry + (1−Kdry/Kmin)² / (ϕ/Kfl + (1−ϕ)/Kmin − Kdry/Kmin²)',
      'Backus averaging, wedge model, wavelet generation (Ricker, Ormsby, Klauder)',
    ],
    departments: ['Seismic', 'Reservoir'],
    github: 'github.com/agilescientific/bruges',
    language: 'Python',
  },
  {
    slug: 'pyreservoir',
    name: 'pyreservoir',
    stars: 179,
    org: 'Academic',
    description: 'Reservoir engineering calculations library with 12 Jupyter notebooks covering material balance, PVT correlations, Buckley-Leverett displacement, and well transient analysis.',
    capabilities: [
      'Arps decline curve analysis: q(t) = qi / (1 + b·Di·t)^(1/b)',
      'PVT correlations: Standing, Vasquez-Beggs, Glaso; oil/gas material balance',
      'Buckley-Leverett fractional flow, aquifer influx, well drawdown & transient response',
    ],
    departments: ['Reservoir', 'Economics'],
    github: 'github.com/yohanesnuwara/pyreservoir',
    language: 'Python',
  },
  {
    slug: 'pyscal',
    name: 'pyscal',
    stars: 66,
    org: 'Equinor',
    description: 'Equinor\'s relative permeability and SCAL (Special Core Analysis) library for reservoir simulation. Generates kr and capillary pressure tables using Corey and LET models.',
    capabilities: [
      'Corey relative permeability: kr_w = (Sw*)^Nw, normalized saturation endpoint scaling',
      'LET model: kr = L·S^E / (L·S^E + T·(1−S)^P) for smooth S-curves',
      'SCAL table export for Eclipse/OPM simulator input, SWOF/SGOF keywords',
    ],
    departments: ['Reservoir'],
    github: 'github.com/equinor/pyscal',
    language: 'Python',
  },
  {
    slug: 'peg-python',
    name: 'PEG_Python',
    stars: 84,
    org: 'Academic',
    description: 'Petroleum Engineering notebooks covering decline curve analysis (single-well, multiwell, probabilistic, welltype), reservoir simulation, and Volve BHP ML prediction.',
    capabilities: [
      'Multi-well DCA with probabilistic forecasting and welltype curve generation',
      'Reservoir simulation workflows with pressure transient analysis',
      'Volve field BHP prediction using AIML regression models',
    ],
    departments: ['Reservoir', 'Economics', 'Drilling'],
    github: 'github.com/orkahub/PEG_Python',
    language: 'Python',
  },
  {
    slug: 'oil-gas-portfolio',
    name: 'oil-gas-python-portfolio',
    stars: null,
    org: 'Community',
    description: 'Portfolio of oil & gas Python analyses using the real Volve open dataset. Includes decline curve analysis, production forecasting, and reservoir performance studies.',
    capabilities: [
      'Decline curve analysis on Volve field production data (real open dataset)',
      'Production forecasting with Arps and modified hyperbolic models',
      'Well performance ranking and EUR (Estimated Ultimate Recovery) calculations',
    ],
    departments: ['Reservoir', 'Economics'],
    github: 'github.com/sly2997/oil-gas-python-portfolio',
    language: 'Python',
  },
  {
    slug: 'pytroleum',
    name: 'pytroleum',
    stars: null,
    org: 'Community',
    description: 'Petroleum engineering economics library covering NPV, IRR, payout calculations, and economic limit analysis for upstream project evaluation.',
    capabilities: [
      'NPV and IRR calculations with time-value-of-money discounting',
      'Payout period, profitability index, and economic-limit oil rate',
      'Sensitivity analysis and Monte Carlo economics for upstream projects',
    ],
    departments: ['Economics', 'Reservoir'],
    github: 'github.com/WaltXon/pytroleum',
    language: 'Python',
  },
  {
    slug: 'python-pet-eng',
    name: 'Python-Projects-in-Petroleum-Engineering',
    stars: null,
    org: 'Academic',
    description: 'Collection of Python notebooks covering flash calculations (PR EOS), fractional flow theory, pressure testing, and PVT property estimation.',
    capabilities: [
      'Flash calculations using Peng-Robinson equation of state',
      'Fractional flow curves and Buckley-Leverett displacement efficiency',
      'Pressure transient analysis: buildup, drawdown, and skin calculation',
    ],
    departments: ['Reservoir', 'Drilling'],
    github: 'github.com/Idris-Kagdi/Python-Projects-in-Petroleum-Engineering',
    language: 'Python',
  },
  {
    slug: 'seg-tutorials',
    name: 'tutorials',
    stars: 152,
    org: 'Academic',
    description: 'SEG (Society of Exploration Geophysicists) tutorial collection. Covers seismic processing, rock physics, machine learning for seismic interpretation, and geophysical inversion.',
    capabilities: [
      'Seismic attribute computation, AVO analysis, and spectral decomposition',
      'Rock physics crossplots: Vp/Vs ratio, impedance, lambda-rho / mu-rho',
      'ML-based seismic facies classification and petrophysical property prediction',
    ],
    departments: ['Seismic', 'Petrophysics'],
    github: 'github.com/seg/tutorials',
    language: 'Python',
  },
];

const FILTER_TABS = ['All', 'Petrophysics', 'Reservoir', 'Drilling', 'Seismic', 'Economics'] as const;
type FilterTab = typeof FILTER_TABS[number];

export default function IntegrationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  const filtered = activeFilter === 'All'
    ? LIBRARIES
    : LIBRARIES.filter(lib => lib.departments.includes(activeFilter as Department));

  const totalStars = LIBRARIES.reduce((sum, l) => sum + (l.stars ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🔗</span>
          <h1 className="text-2xl font-bold text-white">O&amp;G Open Source Integrations</h1>
        </div>
        <p className="text-gray-400 ml-9">
          10 industry libraries integrated — petrophysics, reservoir engineering, drilling, seismic
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Libraries', value: '10', icon: '📦' },
          { label: 'Departments', value: '4', icon: '🏢' },
          { label: 'Combined Stars', value: `~${totalStars.toLocaleString()}`, icon: '⭐' },
          { label: 'Algorithms', value: '50+', icon: '🧮' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{kpi.icon}</span>
            <div>
              <div className="text-xl font-bold text-amber-400">{kpi.value}</div>
              <div className="text-xs text-gray-400">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === tab
                ? 'bg-amber-500 text-black'
                : 'bg-[#0f1629] border border-[#1e2a45] text-gray-400 hover:text-gray-200 hover:border-amber-500/40'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs opacity-70">
                {LIBRARIES.filter(l => l.departments.includes(tab as Department)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(lib => (
          <div key={lib.slug} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-5 flex flex-col hover:border-amber-500/30 transition-colors">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">{lib.name}</h2>
                {lib.stars !== null && (
                  <span className="flex items-center gap-1 bg-amber-900/40 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-700/40">
                    ⭐ {lib.stars}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ORG_COLORS[lib.org]}`}>
                {lib.org}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{lib.description}</p>

            {/* Capabilities */}
            <ul className="space-y-1.5 mb-4">
              {lib.capabilities.map((cap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">▸</span>
                  <span>{cap}</span>
                </li>
              ))}
            </ul>

            {/* Department Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {lib.departments.map(dept => (
                <span key={dept} className={`text-xs px-2 py-0.5 rounded ${DEPT_COLORS[dept]}`}>
                  {dept}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1e2a45]">
              <span className="text-xs text-gray-600 font-mono">{lib.github}</span>
              <Link
                href={`/integrations/${lib.slug}`}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-lg hover:bg-amber-500/20 transition-colors font-medium"
              >
                View Integration →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No libraries found for filter: {activeFilter}
        </div>
      )}
    </div>
  );
}
