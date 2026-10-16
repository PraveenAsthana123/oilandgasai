export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import pool from '@/lib/db';

interface Library {
  slug: string;
  name: string;
  stars: number | null;
  organization: string;
  department: string[];
  description: string;
  key_capabilities: string[];
  license: string;
  language: string;
  clone_path: string;
  portal_pages: string[];
}

const LIBRARIES: Library[] = [
  {
    slug: 'lasio',
    name: 'lasio',
    stars: 404,
    organization: 'Community (kinverarity1)',
    department: ['Petrophysics', 'Drilling'],
    description: 'Industry-standard Python library for reading and writing LAS (Log ASCII Standard) well log files. Supports LAS 1.2, 2.0, and 3.0 formats.',
    key_capabilities: [
      'Parse LAS 1.2 / 2.0 / 3.0 well log files with full header preservation',
      'Read/write GR, RHOB, NPHI, DT, RT, CALI and all standard curve mnemonics',
      'Depth-step validation, unit conversion, and null-value handling',
    ],
    license: 'MIT',
    language: 'Python',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/lasio',
    portal_pages: ['/upstream/exploration', '/data/types', '/upstream/well-integrity'],
  },
  {
    slug: 'welly',
    name: 'welly',
    stars: 376,
    organization: 'Agile Scientific',
    department: ['Petrophysics', 'Reservoir'],
    description: 'Data science toolkit for well log analysis. Provides a Well object model with QC, normalization, correlation, and synthetic log generation capabilities.',
    key_capabilities: [
      'Well object model with multi-curve container, header, and location metadata',
      'QC methods: despiking (Hampel filter), normalization (P5/P95), depth-shift',
      'Well-to-well curve correlation and synthetic log generation',
    ],
    license: 'Apache 2.0',
    language: 'Python',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/welly',
    portal_pages: ['/upstream/reservoir', '/ai/statistical-ml', '/data/quality'],
  },
  {
    slug: 'bruges',
    name: 'bruges',
    stars: 318,
    organization: 'Agile Scientific',
    department: ['Seismic', 'Reservoir'],
    description: 'Bag of geoscience equations covering seismic rock physics, AVO, wavelets, and modelling. Provides Aki-Richards, Zoeppritz, Gassmann, Backus, and wedge model implementations.',
    key_capabilities: [
      'Aki-Richards and full Zoeppritz reflection coefficient equations',
      'Gassmann fluid substitution: Ksat = Kdry + (1−Kdry/Kmin)² / (ϕ/Kfl + (1−ϕ)/Kmin − Kdry/Kmin²)',
      'Backus averaging, wedge model, wavelet generation (Ricker, Ormsby, Klauder)',
    ],
    license: 'Apache 2.0',
    language: 'Python',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/bruges',
    portal_pages: ['/upstream/exploration', '/upstream/reservoir', '/ai/statistical-ml'],
  },
  {
    slug: 'pyreservoir',
    name: 'pyreservoir',
    stars: 179,
    organization: 'Academic (yohanesnuwara)',
    department: ['Reservoir', 'Economics'],
    description: 'Reservoir engineering calculations library with 12 Jupyter notebooks covering material balance, PVT correlations, Buckley-Leverett, and well transient analysis.',
    key_capabilities: [
      'Arps decline curve analysis: q(t) = qi / (1 + b·Di·t)^(1/b)',
      'PVT correlations: Standing, Vasquez-Beggs, Glaso; oil/gas material balance',
      'Buckley-Leverett fractional flow, aquifer influx, well drawdown & transient response',
    ],
    license: 'MIT',
    language: 'Python',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/pyreservoir',
    portal_pages: ['/upstream/reservoir', '/ai/machine-learning', '/historical-db'],
  },
  {
    slug: 'pyscal',
    name: 'pyscal',
    stars: 66,
    organization: 'Equinor',
    department: ['Reservoir'],
    description: "Equinor's relative permeability and SCAL library for reservoir simulation. Generates kr and capillary pressure tables using Corey and LET models.",
    key_capabilities: [
      'Corey relative permeability: kr_w = (Sw*)^Nw, normalized saturation endpoint scaling',
      'LET model: kr = L·S^E / (L·S^E + T·(1−S)^P) for smooth S-curves',
      'SCAL table export for Eclipse/OPM simulator input, SWOF/SGOF keywords',
    ],
    license: 'LGPL 3.0',
    language: 'Python',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/pyscal',
    portal_pages: ['/upstream/reservoir', '/data/types'],
  },
  {
    slug: 'peg-python',
    name: 'PEG_Python',
    stars: 84,
    organization: 'Academic (orkahub)',
    department: ['Reservoir', 'Economics', 'Drilling'],
    description: 'Petroleum Engineering notebooks: DCA (single-well, multiwell, probabilistic, welltype), reservoir simulation, and Volve BHP ML prediction.',
    key_capabilities: [
      'Multi-well DCA with probabilistic P10/P50/P90 EUR forecasting',
      'Welltype curve generation for unconventional plays',
      'Volve field BHP prediction using AIML regression models (Random Forest/XGBoost)',
    ],
    license: 'MIT',
    language: 'Python (Jupyter)',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/PEG_Python',
    portal_pages: ['/upstream/reservoir', '/ai/machine-learning', '/upstream/production'],
  },
  {
    slug: 'oil-gas-portfolio',
    name: 'oil-gas-python-portfolio',
    stars: null,
    organization: 'Community (sly2997)',
    department: ['Reservoir', 'Economics'],
    description: 'Portfolio of oil & gas Python analyses using the real Volve open dataset. Includes decline curve analysis, production forecasting, and well performance ranking.',
    key_capabilities: [
      'Decline curve analysis on Volve field production data (real open dataset)',
      'Production forecasting with Arps and modified hyperbolic models',
      'Well performance ranking and EUR (Estimated Ultimate Recovery) calculations',
    ],
    license: 'Not specified',
    language: 'Python (Jupyter)',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/oil-gas-python-portfolio',
    portal_pages: ['/upstream/production', '/historical-db'],
  },
  {
    slug: 'pytroleum',
    name: 'pytroleum',
    stars: null,
    organization: 'Community (WaltXon)',
    department: ['Economics', 'Reservoir'],
    description: 'Petroleum engineering economics library covering NPV, IRR, payout calculations, and economic limit analysis for upstream project evaluation.',
    key_capabilities: [
      'NPV and IRR calculations with time-value-of-money discounting',
      'Payout period, profitability index, and economic-limit oil rate',
      'Sensitivity analysis and Monte Carlo economics for upstream projects',
    ],
    license: 'MIT',
    language: 'Python',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/pytroleum',
    portal_pages: ['/downstream/trading', '/upstream/production'],
  },
  {
    slug: 'python-pet-eng',
    name: 'Python-Projects-in-Petroleum-Engineering',
    stars: null,
    organization: 'Academic (Idris-Kagdi)',
    department: ['Reservoir', 'Drilling'],
    description: 'Python notebooks covering flash calculations (PR EOS), fractional flow theory, pressure testing, and PVT property estimation.',
    key_capabilities: [
      'Flash calculations using Peng-Robinson equation of state (Rachford-Rice)',
      'Fractional flow curves and Buckley-Leverett displacement efficiency',
      'Pressure transient analysis: Horner buildup, drawdown, and skin calculation',
    ],
    license: 'Not specified',
    language: 'Python (Jupyter)',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/Python-Projects-in-Petroleum-Engineering',
    portal_pages: ['/upstream/reservoir', '/upstream/drilling'],
  },
  {
    slug: 'seg-tutorials',
    name: 'tutorials',
    stars: 152,
    organization: 'Academic (SEG)',
    department: ['Seismic', 'Petrophysics'],
    description: 'SEG (Society of Exploration Geophysicists) tutorial collection covering seismic processing, rock physics, ML for seismic interpretation, and geophysical inversion.',
    key_capabilities: [
      'Seismic attribute computation, AVO analysis, and spectral decomposition',
      'Rock physics crossplots: Vp/Vs ratio, P/S-impedance, lambda-rho / mu-rho',
      'ML-based seismic facies classification and petrophysical property prediction',
    ],
    license: 'CC-BY',
    language: 'Python (Jupyter)',
    clone_path: '/mnt/deepa/sohamyoga/oil-gas-integrations/tutorials',
    portal_pages: ['/upstream/exploration', '/ai/image-classification', '/ai/statistical-ml'],
  },
];

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ogo_integration (
      id           SERIAL PRIMARY KEY,
      slug         TEXT UNIQUE NOT NULL,
      name         TEXT NOT NULL,
      stars        INTEGER,
      department   TEXT NOT NULL,
      last_synced  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function upsertLibraries() {
  for (const lib of LIBRARIES) {
    await pool.query(
      `INSERT INTO ogo_integration (slug, name, stars, department, last_synced)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (slug) DO UPDATE
         SET name        = EXCLUDED.name,
             stars       = EXCLUDED.stars,
             department  = EXCLUDED.department,
             last_synced = NOW()`,
      [lib.slug, lib.name, lib.stars, lib.department.join(',')]
    );
  }
}

export async function GET() {
  try {
    await ensureTable();
    await upsertLibraries();
  } catch {
    // DB unavailable — return static data with warning
    return Response.json({
      _warning: 'DB unavailable — returning static library data',
      data: LIBRARIES,
      total: LIBRARIES.length,
      combined_stars: LIBRARIES.reduce((s, l) => s + (l.stars ?? 0), 0),
      synced_at: new Date().toISOString(),
    });
  }

  return Response.json({
    data: LIBRARIES,
    total: LIBRARIES.length,
    combined_stars: LIBRARIES.reduce((s, l) => s + (l.stars ?? 0), 0),
    synced_at: new Date().toISOString(),
  });
}
