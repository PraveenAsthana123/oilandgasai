'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';

interface AlgorithmEntry {
  name: string;
  formula?: string;
  description: string;
}

interface NotebookEntry {
  title: string;
  topic: string;
  formulas: string;
}

interface PortalRef {
  page: string;
  href: string;
  usage: string;
}

interface IntegrationStatus {
  feature: string;
  status: 'done' | 'partial' | 'pending';
  detail: string;
}

interface LibraryDetail {
  slug: string;
  name: string;
  displayName: string;
  stars: number | null;
  org: string;
  license: string;
  language: string;
  description: string;
  problemsSolved: string[];
  departments: { name: string; usage: string }[];
  installCmd: string;
  algorithms: AlgorithmEntry[];
  notebooks: NotebookEntry[];
  portalRefs: PortalRef[];
  integrationStatus: IntegrationStatus[];
}

const LIBRARIES: Record<string, LibraryDetail> = {
  lasio: {
    slug: 'lasio',
    name: 'lasio',
    displayName: 'LAS File I/O Library',
    stars: 404,
    org: 'kinverarity1 (Community)',
    license: 'MIT',
    language: 'Python',
    description:
      'lasio is the industry-standard Python library for reading and writing LAS (Log ASCII Standard) well log files. It supports LAS 1.2, 2.0, and 3.0 formats and handles the full complexity of real-world well log headers, curve mnemonics, depth steps, and null values encountered in production E&P workflows.',
    problemsSolved: [
      'Parsing inconsistent LAS headers from multiple service companies (Schlumberger, Halliburton, Baker Hughes formats)',
      'Handling non-standard null values, duplicate mnemonics, and mixed depth references',
      'Programmatic LAS export for integration with petrophysics software (Petrel, Kingdom)',
    ],
    departments: [
      { name: 'Petrophysics', usage: 'Primary data ingestion for all well log workflows' },
      { name: 'Drilling', usage: 'MWD/LWD data loading for real-time geosteering feedback' },
      { name: 'Reservoir', usage: 'Petrophysical parameter extraction for static model population' },
    ],
    installCmd: 'pip install lasio',
    algorithms: [
      {
        name: 'LAS 1.2 / 2.0 / 3.0 Format Parsing',
        description:
          'Stateful line-by-line parser that transitions between ~V, ~W, ~C, ~A sections. Handles continuation lines, delimiter variants (colon vs. dot vs. space), and multi-line descriptions.',
      },
      {
        name: 'Curve Mnemonic Registry',
        description:
          'Standard O&G mnemonics: GR (gamma ray), RHOB (bulk density), NPHI (neutron porosity), DT (sonic transit time), RT (true resistivity), CALI (caliper). Each mnemonic carries unit, API code, and description.',
      },
      {
        name: 'Depth Step Validation',
        description:
          'Verifies constant depth step (STEP) across all curves, detects depth reversals, flags missing depth index values, and applies STRT/STOP/NULL header values to mask invalid data.',
      },
      {
        name: 'Unit Conversion Framework',
        description:
          'Automatic unit detection from header (m vs ft, g/cc vs kg/m³, us/ft vs us/m). Converts depth index and curve values using a Pint-compatible unit registry.',
      },
    ],
    notebooks: [
      { title: 'LAS File Loading', topic: 'Basic read/write', formulas: 'Depth step, null-value masking' },
      { title: 'Multi-well LAS Merge', topic: 'Cross-well correlation', formulas: 'Depth alignment, mnemonic unification' },
    ],
    portalRefs: [
      { page: 'Seismic & Exploration', href: '/upstream/exploration', usage: 'LAS file upload → petrophysical curve display (GR, RHOB, NPHI, RT tracks)' },
      { page: 'Data Types Registry', href: '/data/types', usage: 'LAS listed as primary well log data format with schema documentation' },
      { page: 'Well Integrity', href: '/upstream/well-integrity', usage: 'CALI curve loading for wellbore geometry assessment' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/lasio' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'partial', detail: 'Upload endpoint planned at /api/upstream/las-upload' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/exploration, /data/types, /upstream/well-integrity' },
      { feature: 'Test data available', status: 'done', detail: 'Sample LAS files in lasio/tests/examples/' },
    ],
  },

  welly: {
    slug: 'welly',
    name: 'welly',
    displayName: 'Well Log Analysis Toolkit',
    stars: 376,
    org: 'Agile Scientific',
    license: 'Apache 2.0',
    language: 'Python',
    description:
      'welly is a data-science toolkit for well log analysis built on NumPy and pandas. It provides a Well object model that wraps LAS curves with QC, normalization, depth-shift, and correlation methods. Designed for petrophysicists working in Jupyter notebooks and Python ML pipelines.',
    problemsSolved: [
      'Inconsistent curve naming across wells in a field — welly normalizes mnemonics to a common schema',
      'Depth misalignment between runs or tools — depth shift and splice methods fix it automatically',
      'Log QC before ML model training — spike removal, normalization, and outlier detection in one call',
    ],
    departments: [
      { name: 'Petrophysics', usage: 'Core QC and normalization pipeline for all well log data' },
      { name: 'Reservoir', usage: 'Input preparation for porosity and Sw estimation workflows' },
      { name: 'AI/ML', usage: 'Feature extraction and normalization before ML model training' },
    ],
    installCmd: 'pip install welly',
    algorithms: [
      {
        name: 'Well Object Model',
        description:
          'Hierarchical container: Project → Well → Curve. Each Well holds a header (location, KB elevation, CRS) and a dict of Curve objects. Curves are NumPy arrays with depth index, units, and mnemonic metadata.',
      },
      {
        name: 'Despiking (Hampel filter)',
        description:
          'Sliding-window median absolute deviation filter. For window w at depth d: spike flagged if |x[d] − median(w)| > k × MAD(w). Default k = 3. Returns cleaned curve with spike indices for QC review.',
      },
      {
        name: 'Normalization (P5/P95)',
        description:
          'Normalizes curve values to a reference well using 5th/95th percentile matching. x_norm = (x − P5_src) / (P95_src − P5_src) × (P95_ref − P5_ref) + P5_ref. Preserves relative log character across wells.',
      },
      {
        name: 'Well-to-Well Curve Correlation',
        description:
          'Computes cross-correlation between curves from two wells on a common depth grid. Identifies stratigraphic picks and depth-shift values. Used for log blocking and facies correlation.',
      },
      {
        name: 'Synthetic Log Generation',
        description:
          'Generates synthetic sonic (DT) from density using empirical Gardner/Castagna transforms. Produces synthetic seismogram as convolution: Trace = Wavelet * Reflectivity_series.',
      },
    ],
    notebooks: [
      { title: 'Well QC Pipeline', topic: 'Despiking + normalization', formulas: 'Hampel filter, P5/P95 normalization' },
      { title: 'Multi-well Correlation', topic: 'Cross-well depth alignment', formulas: 'Cross-correlation, depth shift' },
      { title: 'Synthetic Seismogram', topic: 'Well-to-seismic tie', formulas: 'Zoeppritz RC, wavelet convolution' },
    ],
    portalRefs: [
      { page: 'Reservoir Management', href: '/upstream/reservoir', usage: 'Log QC pipeline: despike → normalize → export for porosity calculation' },
      { page: 'Statistical ML Models', href: '/ai/statistical-ml', usage: 'Feature matrix extraction from normalized well log curves for ML training' },
      { page: 'Data Quality', href: '/data/quality', usage: 'Spike count, coverage %, and normalization residuals reported per well' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/welly' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'partial', detail: 'QC endpoint planned at /api/upstream/well-qc' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/reservoir, /ai/statistical-ml, /data/quality' },
      { feature: 'Test data available', status: 'done', detail: 'Example wells in welly/tests/assets/' },
    ],
  },

  bruges: {
    slug: 'bruges',
    name: 'bruges',
    displayName: 'Geoscience Equations Library',
    stars: 318,
    org: 'Agile Scientific',
    license: 'Apache 2.0',
    language: 'Python',
    description:
      'bruges is a bag of geoscience equations covering seismic rock physics, AVO modelling, wavelets, and forward modelling. Named after the Belgian city, it provides clean NumPy implementations of Aki-Richards, Zoeppritz, Gassmann, Backus averaging, and wedge modelling used in seismic reservoir characterization.',
    problemsSolved: [
      'Reproducing published rock physics crossplots and AVO intercept-gradient analysis without proprietary software',
      'Forward modelling of seismic responses to test DHI (Direct Hydrocarbon Indicator) hypotheses',
      'Fluid substitution to predict 4D seismic response before infill drilling',
    ],
    departments: [
      { name: 'Seismic', usage: 'AVO modelling, wavelet estimation, reflection coefficient computation' },
      { name: 'Reservoir', usage: 'Fluid substitution for 4D feasibility and dynamic model QC' },
      { name: 'Petrophysics', usage: 'Rock physics transforms: density, velocity, elastic moduli' },
    ],
    installCmd: 'pip install bruges',
    algorithms: [
      {
        name: 'Aki-Richards Approximation',
        formula: 'Rpp(θ) ≈ ½ΔVp/Vp − 4(Vs/Vp)²ΔVs/Vs·sin²θ + ½Δρ/ρ·(1/cos²θ)',
        description:
          'Three-term linearized P-P reflection coefficient. Used for AVO intercept (θ=0) and gradient extraction. Input: Vp1/Vs1/ρ1 above, Vp2/Vs2/ρ2 below, angle θ.',
      },
      {
        name: 'Full Zoeppritz Equations',
        description:
          '4×4 matrix solution for P-P, P-S, S-P, S-S reflection and transmission coefficients. Exact at all angles including post-critical. Used when linearized AVO approximations break down.',
      },
      {
        name: 'Gassmann Fluid Substitution',
        formula: 'Ksat = Kdry + (1 − Kdry/Kmin)² / (ϕ/Kfl + (1−ϕ)/Kmin − Kdry/Kmin²)',
        description:
          'Predicts saturated bulk modulus Ksat from dry-rock frame (Kdry), mineral (Kmin), fluid (Kfl) moduli, and porosity ϕ. Shear modulus unchanged by fluid: Gsat = Gdry.',
      },
      {
        name: 'Backus Averaging',
        description:
          'Computes effective VTI anisotropy parameters (C11, C13, C33, C44, C66) for a finely layered medium. Used to upscale thin-bed sequences to seismic wavelength for forward modelling.',
      },
      {
        name: 'Wedge Model',
        description:
          'Generates synthetic seismic response for a wedge-shaped reservoir thinning below tuning thickness. Demonstrates constructive/destructive interference and tuning thickness = λ/4.',
      },
    ],
    notebooks: [
      { title: 'AVO Modelling', topic: 'Aki-Richards intercept/gradient', formulas: 'Aki-Richards 3-term, Shuey approximation' },
      { title: 'Gassmann Fluid Sub', topic: '4D seismic feasibility', formulas: 'Gassmann Ksat, Biot coefficient' },
      { title: 'Wedge Model', topic: 'Seismic tuning', formulas: 'Convolution, tuning thickness λ/4' },
      { title: 'Rock Physics Crossplots', topic: 'Vp-Vs-ρ analysis', formulas: 'Castagna mudrock line, Han correlations' },
    ],
    portalRefs: [
      { page: 'Seismic & Exploration', href: '/upstream/exploration', usage: 'Reflection coefficient computation for AVO attribute display' },
      { page: 'Reservoir Management', href: '/upstream/reservoir', usage: 'Gassmann fluid substitution for 4D feasibility studies' },
      { page: 'Statistical ML Models', href: '/ai/statistical-ml', usage: 'Rock physics prior distributions for Bayesian ML inversion' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/bruges' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'partial', detail: 'AVO endpoint planned at /api/upstream/avo-model' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/exploration, /upstream/reservoir' },
      { feature: 'Test data available', status: 'done', detail: 'bruges/tests/ contains unit test datasets' },
    ],
  },

  pyreservoir: {
    slug: 'pyreservoir',
    name: 'pyreservoir',
    displayName: 'Reservoir Engineering Calculations',
    stars: 179,
    org: 'Academic (yohanesnuwara)',
    license: 'MIT',
    language: 'Python',
    description:
      'pyreservoir is a comprehensive reservoir engineering library with 12 Jupyter notebooks covering the full spectrum of conventional reservoir analysis: material balance, PVT correlations, decline curve analysis, Buckley-Leverett displacement, well transient response, and volumetric estimation.',
    problemsSolved: [
      'Matching field production data to material balance equations to estimate OOIP and drive mechanisms',
      'Generating PVT tables without PVT software using Standing/Vasquez-Beggs correlations',
      'Buckley-Leverett fractional flow prediction before waterflood startup',
    ],
    departments: [
      { name: 'Reservoir', usage: 'Core reservoir engineering analysis: MBE, DCA, PVT, flow' },
      { name: 'Economics', usage: 'EUR and reserve estimation from decline curve analysis' },
      { name: 'Drilling', usage: 'Well test interpretation: buildup analysis, skin factor' },
    ],
    installCmd: 'pip install pyreservoir',
    algorithms: [
      {
        name: 'Arps Decline Curve Analysis',
        formula: 'q(t) = qi / (1 + b·Di·t)^(1/b)',
        description:
          'Generalized Arps hyperbolic decline. b=0: exponential q=qi·exp(−Di·t); b=1: harmonic q=qi/(1+Di·t); 0<b<1: hyperbolic. EUR = ∫q(t)dt from t=0 to abandonment rate qa.',
      },
      {
        name: 'Oil Material Balance Equation (MBE)',
        formula: 'Np[Bo + (Rp−Rs)Bg] = N[(Bo−Boi) + (Rsi−Rs)Bg + mBoi(Bg/Bgi−1)] + We·Bw + WinjBw',
        description:
          'Havlena-Odeh linearized form used to identify drive mechanism (solution-gas drive, gas cap, aquifer). Plot F vs Eo+mEg to identify OOIP N from slope.',
      },
      {
        name: 'PVT Correlations — Standing (1947)',
        formula: 'Rs = γg·[(p/18.2 + 1.4)·10^(0.0125·API) / 10^(0.00091·T)]^1.205',
        description:
          'Solution GOR correlation valid for California crude oils. Vasquez-Beggs extends coverage to broader API ranges. Used where laboratory PVT data is unavailable.',
      },
      {
        name: 'Buckley-Leverett Fractional Flow',
        formula: 'fw = [1 + (Ao/Aw)·(krw/kro)] — with shock front at dfw/dSw|Sw*',
        description:
          'Water fractional flow as function of water saturation. Shock front Sw* found where chord from Swi to fw curve is tangent. Gives waterflood breakthrough time and recovery efficiency.',
      },
      {
        name: 'Aquifer Influx (Fetkovitch)',
        formula: 'We = ΣWeoi·[1 − exp(−ji·Δt/Weoi)]·(pavg − pi)',
        description:
          'Tank model aquifer influx. Cumulative influx We matched to production history to determine aquifer strength and productivity index ji.',
      },
      {
        name: 'Well Drawdown / Transient Response',
        formula: 'pwf = pi − 162.6·q·μ·Bo/(k·h)·[log(t) + log(k/(ϕ·μ·ct·rw²)) − 3.2275 + 0.8686·S]',
        description:
          'Radial flow pressure drawdown equation (Darcy units). Semi-log plot of pwf vs log(t) gives slope m = 162.6qμBo/(kh) used to calculate permeability k and skin S.',
      },
    ],
    notebooks: [
      { title: 'aquifer_influx', topic: 'Aquifer influx modelling', formulas: 'Fetkovitch tank model, Van Everdingen-Hurst' },
      { title: 'buckley_leverett', topic: 'Waterflood displacement', formulas: 'Fractional flow, Welge tangent, Buckley-Leverett' },
      { title: 'decline_curve_analysis', topic: 'Arps DCA', formulas: 'Hyperbolic/exponential/harmonic, EUR' },
      { title: 'gas_mbal', topic: 'Gas material balance', formulas: 'p/z plot, OGIP, gas expansion drive' },
      { title: 'oil_mbal', topic: 'Oil material balance', formulas: 'Havlena-Odeh, Eo/Eg/Ef drive plot' },
      { title: 'oil_reservoir_drive', topic: 'Drive mechanism classification', formulas: 'Recovery factor by drive type' },
      { title: 'pvt_correlation', topic: 'PVT property estimation', formulas: 'Standing Rs, Bo, Bg; Vasquez-Beggs' },
      { title: 'reproducing_katz_chart', topic: 'Natural gas z-factor', formulas: 'Hall-Yarborough z-factor correlation' },
      { title: 'reservoir_pressure', topic: 'Static reservoir pressure', formulas: 'MDH, Horner buildup, p* extrapolation' },
      { title: 'volumetrics', topic: 'OOIP/OGIP estimation', formulas: 'Volumetric equation: N = 7758·Ah·ϕ·Sw·Bo' },
      { title: 'well_drawdown_testing', topic: 'Drawdown test analysis', formulas: 'Semi-log plot, k·h, skin S' },
      { title: 'well_transient_response', topic: 'Pressure transient analysis', formulas: 'Horner time, flow regime identification' },
    ],
    portalRefs: [
      { page: 'Reservoir Management (Process)', href: '/upstream/reservoir', usage: 'DCA, MBE, and PVT workflows integrated into reservoir performance dashboard' },
      { page: 'ML Models', href: '/ai/machine-learning', usage: 'DCA parameters (qi, Di, b) as features for ML-based EUR uncertainty quantification' },
      { page: 'Historical DB Viewer', href: '/historical-db', usage: 'pyreservoir output tables (EUR, OOIP, k, S) stored in ogo_reservoir_results' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/pyreservoir' },
      { feature: 'Python formulas documented', status: 'done', detail: '12 notebooks listed + 6 algorithms documented above' },
      { feature: 'API route using library', status: 'partial', detail: 'DCA endpoint planned at /api/upstream/decline-curve' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/reservoir, /ai/machine-learning, /historical-db' },
      { feature: 'Test data available', status: 'done', detail: 'Volve field CSV data included in repo notebooks/' },
    ],
  },

  pyscal: {
    slug: 'pyscal',
    name: 'pyscal',
    displayName: 'Relative Permeability / SCAL',
    stars: 66,
    org: 'Equinor',
    license: 'LGPL 3.0',
    language: 'Python',
    description:
      'pyscal is Equinor\'s open-source relative permeability and capillary pressure library for reservoir simulation. It generates SCAL (Special Core Analysis) tables in Eclipse/OPM simulator format using Corey and LET parametric models with full interpolation support for history matching.',
    problemsSolved: [
      'Generating consistent kr/Pc tables for Eclipse SWOF/SGOF keywords without manual spreadsheet work',
      'Interpolating between pessimistic/base/optimistic SCAL cases during uncertainty quantification',
      'Ensuring physical consistency of relative permeability curves (monotonicity, endpoint saturation)',
    ],
    departments: [
      { name: 'Reservoir', usage: 'SCAL table generation for dynamic simulation model input' },
    ],
    installCmd: 'pip install pyscal',
    algorithms: [
      {
        name: 'Corey Relative Permeability',
        formula: 'kr_w(Sw) = krw_max · Sw*^Nw,   Sw* = (Sw − Swcr) / (1 − Swcr − Sorw)',
        description:
          'Power-law model. Normalized saturation Sw* maps [Swcr, 1−Sorw] → [0, 1]. krw_max is end-point relative permeability at Sw = 1−Sorw. Nw (Corey exponent) controls curvature.',
      },
      {
        name: 'LET Relative Permeability',
        formula: 'kr(S) = L · S^E / (L · S^E + T · (1−S)^P)',
        description:
          'Three-parameter model (L, E, T) providing more shape flexibility than Corey. L controls low-S behavior, T controls high-S behavior, E controls the inflection point. Applied to both water and oil curves independently.',
      },
      {
        name: 'Capillary Pressure (Brooks-Corey)',
        formula: 'Pc(Sw) = Pe · (Sw*)^(−1/λ)',
        description:
          'Brooks-Corey capillary pressure model. Pe = entry pressure, λ = pore-size distribution index. Used for drainage (primary) and imbibition (hysteresis) curves.',
      },
      {
        name: 'SCAL Interpolation',
        description:
          'Linear interpolation between pessimistic/base/optimistic kr parameter sets using a single scalar (−1 to +1). Used in ensemble history matching to span the SCAL uncertainty space.',
      },
      {
        name: 'Eclipse Keyword Export',
        description:
          'Generates valid SWOF (oil-water) and SGOF (oil-gas) saturation function tables formatted for Eclipse 100/300 and OPM simulators. Includes header comments with parameter values for traceability.',
      },
    ],
    notebooks: [
      { title: 'Corey kr Generation', topic: 'SWOF/SGOF table generation', formulas: 'Corey kr_w, kr_o, endpoint scaling' },
      { title: 'LET Model Comparison', topic: 'LET vs Corey comparison', formulas: 'LET S-curve parametrization' },
      { title: 'SCAL Interpolation', topic: 'History matching uncertainty', formulas: 'Linear interpolation pessimistic/optimistic' },
    ],
    portalRefs: [
      { page: 'Reservoir Management', href: '/upstream/reservoir', usage: 'SCAL table generation widget for simulation model input deck preparation' },
      { page: 'Data Types Registry', href: '/data/types', usage: 'SWOF/SGOF listed as reservoir simulation data type with pyscal schema' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/pyscal' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'partial', detail: 'SCAL endpoint planned at /api/upstream/scal-tables' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/reservoir, /data/types' },
      { feature: 'Test data available', status: 'done', detail: 'pyscal/tests/ contains parametric test cases' },
    ],
  },

  'peg-python': {
    slug: 'peg-python',
    name: 'PEG_Python',
    displayName: 'Petroleum Engineering Notebooks',
    stars: 84,
    org: 'Academic (orkahub)',
    license: 'MIT',
    language: 'Python (Jupyter)',
    description:
      'PEG_Python (Petroleum Engineering with Python) is a collection of production-ready notebooks covering decline curve analysis across four DCA variants, reservoir simulation basics, and Volve field BHP prediction using AIML regression. Used as a reference implementation for production engineering workflows.',
    problemsSolved: [
      'Single-well, multiwell, probabilistic, and welltype DCA in one consistent codebase',
      'Bridging traditional petroleum engineering calculations with modern ML workflows',
      'Volve open-dataset BHP prediction demonstrating ML applicability to real field data',
    ],
    departments: [
      { name: 'Reservoir', usage: 'DCA forecasting, reservoir simulation workflows' },
      { name: 'Economics', usage: 'EUR calculation and probabilistic reserve estimation' },
      { name: 'Drilling', usage: 'BHP prediction and wellbore pressure management' },
    ],
    installCmd: 'pip install pandas numpy scipy matplotlib scikit-learn',
    algorithms: [
      {
        name: 'Single-Well Arps DCA',
        formula: 'q(t) = qi / (1 + b·Di·t)^(1/b)',
        description:
          'Curve-fit Arps parameters (qi, Di, b) to historical production using scipy.optimize.curve_fit. Forecast to economic limit qa to compute EUR.',
      },
      {
        name: 'Multiwell Type Curve',
        formula: 'q_type(t) = geometric_mean[q_norm_i(t)] for i in {all wells in window}',
        description:
          'Normalizes individual well rates by peak rate, bins by time-on-production, computes geometric mean type curve. Used for new well EUR estimation in unconventional plays.',
      },
      {
        name: 'Probabilistic DCA (Monte Carlo)',
        description:
          'Samples uncertainty distributions for qi, Di, b from historical well analogues. Runs N=1000+ DCA realisations to produce P10/P50/P90 EUR distributions for booking purposes.',
      },
      {
        name: 'Volve BHP ML Prediction',
        description:
          'Regression model (Random Forest / XGBoost) trained on Volve open field data. Features: choke size, GOR, WHP, production rate. Target: bottomhole pressure. RMSE and feature importance reported.',
      },
    ],
    notebooks: [
      { title: 'DCA — Single Well', topic: 'Arps curve fitting, single well', formulas: 'Arps hyperbolic, exponential, harmonic' },
      { title: 'DCA — Multiwell', topic: 'Portfolio DCA and EUR aggregation', formulas: 'Arithmetic/harmonic aggregation, P50 EUR' },
      { title: 'DCA — Probabilistic', topic: 'Monte Carlo EUR estimation', formulas: 'P10/P50/P90 reserve bands' },
      { title: 'DCA — Welltype Curve', topic: 'Unconventional type curve', formulas: 'Normalized production, geometric mean' },
      { title: 'AIML — Volve BHP Prediction', topic: 'ML bottomhole pressure prediction', formulas: 'Feature importance, RMSE, R²' },
    ],
    portalRefs: [
      { page: 'Reservoir Management', href: '/upstream/reservoir', usage: 'Probabilistic DCA for EUR and reserve distribution' },
      { page: 'ML Models', href: '/ai/machine-learning', usage: 'Volve BHP prediction as reference ML case study' },
      { page: 'Production Engineering', href: '/upstream/production', usage: 'Welltype curve generation for new well performance forecasting' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/PEG_Python' },
      { feature: 'Python formulas documented', status: 'done', detail: '5 DCA notebooks + Volve AIML notebook listed above' },
      { feature: 'API route using library', status: 'partial', detail: 'DCA endpoint planned at /api/upstream/dca-forecast' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/reservoir, /ai/machine-learning, /upstream/production' },
      { feature: 'Test data available', status: 'done', detail: 'Volve field CSV data in PEG_Python/AIML/data/' },
    ],
  },

  'oil-gas-portfolio': {
    slug: 'oil-gas-portfolio',
    name: 'oil-gas-python-portfolio',
    displayName: 'Volve Field Analysis Portfolio',
    stars: null,
    org: 'Community (sly2997)',
    license: 'Not specified',
    language: 'Python (Jupyter)',
    description:
      'A portfolio of oil and gas Python analyses using the real Volve open dataset from Equinor. Covers decline curve analysis, production performance, well ranking, and EUR estimation using actual field production data from the North Sea.',
    problemsSolved: [
      'Demonstrating end-to-end DCA on real production data (not synthetic)',
      'Well performance ranking and identification of underperforming wells',
      'EUR estimation and remaining reserve calculation for mature field management',
    ],
    departments: [
      { name: 'Reservoir', usage: 'Production history matching and EUR estimation' },
      { name: 'Economics', usage: 'Economic limit analysis and field-level reserve booking' },
    ],
    installCmd: 'pip install pandas numpy scipy matplotlib plotly',
    algorithms: [
      {
        name: 'Arps DCA on Volve Production Data',
        formula: 'q(t) = qi / (1 + b·Di·t)^(1/b)',
        description: 'Applied to Volve oil production history. Fits Arps parameters per well using LMFIT nonlinear least squares.',
      },
      {
        name: 'EUR Calculation',
        formula: 'EUR = ∫[0 to t_aban] q(t) dt + Np_historical',
        description: 'Integrates forecast DCA curve from current time to economic abandonment rate. Adds cumulative historical production for total EUR.',
      },
      {
        name: 'Well Performance Ranking',
        description: 'Normalizes wells by peak rate and time-on-production. Ranks by normalized EUR, current production rate, and decline rate for asset management prioritization.',
      },
    ],
    notebooks: [
      { title: 'Volve DCA Analysis', topic: 'Decline curve on real field data', formulas: 'Arps DCA, EUR, economic limit' },
      { title: 'Well Performance Dashboard', topic: 'Multi-well production comparison', formulas: 'Rate normalization, ranking metrics' },
    ],
    portalRefs: [
      { page: 'Production Engineering', href: '/upstream/production', usage: 'Volve field production data as demo dataset for DCA workflows' },
      { page: 'Historical DB Viewer', href: '/historical-db', usage: 'Volve production tables ingested into ogo_production_history' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/oil-gas-python-portfolio' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'pending', detail: 'Data ingestion endpoint not yet built' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/production, /historical-db' },
      { feature: 'Test data available', status: 'done', detail: 'Volve open dataset CSV files included in repo' },
    ],
  },

  pytroleum: {
    slug: 'pytroleum',
    name: 'pytroleum',
    displayName: 'Petroleum Economics Library',
    stars: null,
    org: 'Community (WaltXon)',
    license: 'MIT',
    language: 'Python',
    description:
      'pytroleum is a petroleum engineering economics library covering NPV, IRR, payout calculations, economic limit analysis, and profitability index calculations for upstream project evaluation and investment decisions.',
    problemsSolved: [
      'Rapid economic screening of drilling proposals without proprietary economics software',
      'Sensitivity analysis on oil price and cost assumptions for investment decisions',
      'Economic limit oil rate calculation for production shutdown decisions',
    ],
    departments: [
      { name: 'Economics', usage: 'Project NPV, IRR, payout, and economic limit analysis' },
      { name: 'Reservoir', usage: 'Production-economics integration for field development optimization' },
    ],
    installCmd: 'pip install pytroleum',
    algorithms: [
      {
        name: 'Net Present Value (NPV)',
        formula: 'NPV = Σ [CF_t / (1 + r)^t] — I₀',
        description: 'Discounts annual cash flows CF_t at discount rate r. I₀ = initial capital investment. Positive NPV indicates economic project at given oil price and cost assumption.',
      },
      {
        name: 'Internal Rate of Return (IRR)',
        description: 'Discount rate r* where NPV = 0. Solved numerically using Newton-Raphson iteration. Compared to hurdle rate (typically 15-20% for upstream E&P).',
      },
      {
        name: 'Payout Period',
        formula: 'Payout = time when Σ CF_t = I₀',
        description: 'Simple payback period calculation. Discounted payout uses discounted cash flows. Typical upstream projects target <3 year payout.',
      },
      {
        name: 'Economic Limit Oil Rate',
        formula: 'q_econ = OPEX / (price × (1 − tax_rate) − royalty)',
        description: 'Minimum gross oil rate to cover operating costs, taxes, and royalties. Used to determine well abandonment timing in combination with DCA forecast.',
      },
    ],
    notebooks: [
      { title: 'Upstream Project Economics', topic: 'NPV, IRR, payout analysis', formulas: 'DCF, NPV, IRR, profitability index' },
      { title: 'Economic Limit Analysis', topic: 'Production shutdown decisions', formulas: 'Economic limit rate, abandonment NPV' },
      { title: 'Monte Carlo Economics', topic: 'Uncertainty quantification', formulas: 'P10/P50/P90 NPV distributions' },
    ],
    portalRefs: [
      { page: 'Commercial & Trading', href: '/downstream/trading', usage: 'Project economics screening for upstream investment decisions' },
      { page: 'Production Engineering', href: '/upstream/production', usage: 'Economic limit rate integrated with DCA for abandonment scheduling' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/pytroleum' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'pending', detail: 'Economics endpoint planned at /api/economics/npv' },
      { feature: 'Portal page reference', status: 'done', detail: '/downstream/trading, /upstream/production' },
      { feature: 'Test data available', status: 'partial', detail: 'Basic test cases in repo; no field dataset included' },
    ],
  },

  'python-pet-eng': {
    slug: 'python-pet-eng',
    name: 'Python-Projects-in-Petroleum-Engineering',
    displayName: 'PE Calculations — Flash, Flow, Pressure',
    stars: null,
    org: 'Academic (Idris-Kagdi)',
    license: 'Not specified',
    language: 'Python (Jupyter)',
    description:
      'A collection of Python notebooks implementing fundamental petroleum engineering calculations: flash equilibrium using Peng-Robinson EOS, fractional flow theory, and pressure transient analysis including buildup and drawdown test interpretation.',
    problemsSolved: [
      'Phase equilibrium (flash) calculations for reservoir fluid characterization without PVTSIM/PhazeComp',
      'Fractional flow curve generation for waterflood design without Eclipse or CMG',
      'Pressure buildup analysis and skin factor calculation from field test data',
    ],
    departments: [
      { name: 'Reservoir', usage: 'Flash calc, fractional flow, pressure transient analysis' },
      { name: 'Drilling', usage: 'Skin factor and wellbore damage assessment' },
    ],
    installCmd: 'pip install numpy scipy pandas matplotlib',
    algorithms: [
      {
        name: 'Flash Calculation — Peng-Robinson EOS',
        formula: 'P = RT/(V−b) − a(T)/(V(V+b) + b(V−b))',
        description:
          'Two-parameter cubic EOS. Wilson K-values initialize Rachford-Rice flash. Successive substitution or Newton-Raphson converges to equilibrium K-values. Outputs vapor fraction and phase compositions.',
      },
      {
        name: 'Rachford-Rice Flash',
        formula: 'Σ zi(Ki−1)/(1 + β(Ki−1)) = 0,   β = vapor fraction',
        description: 'Solves for vapor fraction β given component feed fractions zi and K-values Ki. Single-variable equation solved with Brent method.',
      },
      {
        name: 'Fractional Flow',
        formula: 'fw = krw/μw / (krw/μw + kro/μo)',
        description: 'Water fractional flow in absence of gravity/capillary terms. Combined with Corey kr model. Buckley-Leverett shock front found by Welge tangent construction.',
      },
      {
        name: 'Pressure Buildup — Horner Plot',
        formula: 'pws = p* − m·log[(tp + Δt)/Δt]',
        description: 'Miller-Dyes-Hutchinson (MDH) / Horner buildup analysis. Slope m = 162.6qμBo/(kh). Extrapolated p* at (tp+Δt)/Δt = 1. Skin S from Δp_1hr vs m.',
      },
    ],
    notebooks: [
      { title: 'Flash Calculation (PR EOS)', topic: 'Reservoir fluid phase equilibrium', formulas: 'Peng-Robinson EOS, Rachford-Rice, K-values' },
      { title: 'Fractional Flow Theory', topic: 'Waterflood design', formulas: 'Buckley-Leverett, fw, Welge tangent' },
      { title: 'Pressure Transient Analysis', topic: 'Well test interpretation', formulas: 'Horner buildup, MDH, skin S' },
    ],
    portalRefs: [
      { page: 'Reservoir Management', href: '/upstream/reservoir', usage: 'Flash calculations for PVT table generation and phase behavior analysis' },
      { page: 'Drilling Operations', href: '/upstream/drilling', usage: 'Skin factor calculation from pressure buildup tests' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/Python-Projects-in-Petroleum-Engineering' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'pending', detail: 'Flash/PTA endpoints not yet built' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/reservoir, /upstream/drilling' },
      { feature: 'Test data available', status: 'partial', detail: 'Synthetic PVT compositions in notebooks; no field data' },
    ],
  },

  'seg-tutorials': {
    slug: 'seg-tutorials',
    name: 'tutorials',
    displayName: 'SEG Tutorials — Seismic Geoscience',
    stars: 152,
    org: 'Academic (SEG)',
    license: 'CC-BY',
    language: 'Python (Jupyter)',
    description:
      'The Society of Exploration Geophysicists (SEG) tutorial repository contains companion notebooks for The Leading Edge journal tutorials. Covers seismic processing, rock physics, ML for seismic interpretation, geophysical inversion, and AVO analysis.',
    problemsSolved: [
      'Reproducible seismic processing workflows outside commercial software (ProMAX, Vista)',
      'Rock physics analysis and crossplot generation for AVO and DHI interpretation',
      'ML-based seismic facies classification using lithology-labeled training wells',
    ],
    departments: [
      { name: 'Seismic', usage: 'Processing, attribute extraction, AVO, and ML interpretation' },
      { name: 'Petrophysics', usage: 'Rock physics crossplots: Vp-Vs-ρ, impedance inversion' },
    ],
    installCmd: 'pip install numpy scipy matplotlib bruges welly bruges',
    algorithms: [
      {
        name: 'Seismic Attribute Computation',
        description: 'Instantaneous amplitude, phase, and frequency from Hilbert transform. RMS amplitude, peak frequency, and spectral decomposition (short-window FFT) for stratigraphic interpretation.',
      },
      {
        name: 'AVO Intercept-Gradient Analysis',
        formula: 'R(θ) = A + B·sin²θ,   A = intercept, B = gradient',
        description: 'Shuey two-term AVO approximation. Crossplot A vs B identifies fluid/lithology classes (Class I/IIa/II/III/IV AVO anomalies) for DHI calibration.',
      },
      {
        name: 'Rock Physics Crossplots',
        formula: 'Ip = Vp × ρ,   Is = Vs × ρ,   λρ = ρ(Vp² − 2Vs²),   μρ = ρVs²',
        description: 'P-impedance, S-impedance, lambda-rho/mu-rho crossplots from well log Vp, Vs, RHOB. Separates brine sand, gas sand, and shale clusters for seismic facies classification.',
      },
      {
        name: 'ML Seismic Facies Classification',
        description: 'Random Forest / SVM trained on well-log-derived facies at well locations. Predicts facies from seismic attributes (amplitude, Ip, Vp/Vs) at interwell locations. Accuracy validated by blind well tests.',
      },
    ],
    notebooks: [
      { title: 'Seismic Processing Basics', topic: 'NMO, stacking, migration concepts', formulas: 'NMO correction, stacking velocity' },
      { title: 'AVO Analysis', topic: 'Intercept-gradient crossplot', formulas: 'Shuey 2-term AVO, AVO class identification' },
      { title: 'Rock Physics Inversion', topic: 'Vp-Vs crossplot, impedance inversion', formulas: 'Ip, Is, lambda-rho, mu-rho' },
      { title: 'ML for Seismic Facies', topic: 'Supervised facies classification', formulas: 'Feature importance, confusion matrix' },
      { title: 'Spectral Decomposition', topic: 'Time-frequency analysis', formulas: 'Short-window FFT, peak frequency' },
    ],
    portalRefs: [
      { page: 'Seismic & Exploration', href: '/upstream/exploration', usage: 'SEG tutorial AVO and attribute algorithms used in seismic interpretation module' },
      { page: 'Image Classification', href: '/ai/image-classification', usage: 'Seismic facies classification as AI use-case for rock physics-guided ML' },
      { page: 'Statistical ML Models', href: '/ai/statistical-ml', usage: 'SEG rock physics crossplot methods as petrophysical ML feature engineering reference' },
    ],
    integrationStatus: [
      { feature: 'Library cloned locally', status: 'done', detail: '/mnt/deepa/sohamyoga/oil-gas-integrations/tutorials' },
      { feature: 'Python formulas documented', status: 'done', detail: 'Shown in Algorithms tab above' },
      { feature: 'API route using library', status: 'pending', detail: 'Seismic attribute API not yet built' },
      { feature: 'Portal page reference', status: 'done', detail: '/upstream/exploration, /ai/image-classification, /ai/statistical-ml' },
      { feature: 'Test data available', status: 'done', detail: 'Open Penobscot and Teapot Dome seismic data referenced in tutorials' },
    ],
  },
};

const TABS = ['Overview', 'Key Algorithms', 'Use in This Portal', 'Sample Notebooks', 'Integration Status'] as const;
type Tab = typeof TABS[number];

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-green-900/40 text-green-300 border border-green-700/40',
  partial: 'bg-amber-900/40 text-amber-300 border border-amber-700/40',
  pending: 'bg-gray-800/60 text-gray-400 border border-gray-700/40',
};
const STATUS_LABEL: Record<string, string> = { done: '✅ DONE', partial: '⚠️ PARTIAL', pending: '⏳ PENDING' };

export default function LibraryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const lib = LIBRARIES[slug];

  if (!lib) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">🔍</div>
        <h1 className="text-xl text-white font-bold">Library not found: {slug}</h1>
        <Link href="/integrations" className="text-amber-400 hover:underline text-sm">
          ← Back to Integrations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/integrations" className="text-amber-400 hover:underline">GitHub Integrations</Link>
        <span>/</span>
        <span className="text-gray-300">{lib.name}</span>
      </div>

      {/* Header */}
      <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white font-mono">{lib.name}</h1>
              {lib.stars !== null && (
                <span className="bg-amber-900/40 text-amber-300 text-sm px-2 py-0.5 rounded-full border border-amber-700/40">
                  ⭐ {lib.stars}
                </span>
              )}
            </div>
            <div className="text-amber-400 text-sm font-medium mb-2">{lib.displayName}</div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="bg-[#1e2a45] px-2 py-1 rounded">org: {lib.org}</span>
              <span className="bg-[#1e2a45] px-2 py-1 rounded">license: {lib.license}</span>
              <span className="bg-[#1e2a45] px-2 py-1 rounded">lang: {lib.language}</span>
            </div>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg px-4 py-2 font-mono text-sm text-green-400 border border-green-900/40">
            $ {lib.installCmd}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-[#1e2a45] pb-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-amber-400 border-amber-500 bg-[#0f1629]'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#0f1629]/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed">{lib.description}</p>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Problems Solved</h2>
            <ul className="space-y-2">
              {lib.problemsSolved.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-amber-500 mt-0.5">▸</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Department Applicability</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#1e2a45]">
                  <th className="text-left py-2 pr-4 font-medium">Department</th>
                  <th className="text-left py-2 font-medium">How It&apos;s Used</th>
                </tr>
              </thead>
              <tbody>
                {lib.departments.map(dept => (
                  <tr key={dept.name} className="border-b border-[#1e2a45]/50">
                    <td className="py-2.5 pr-4 text-amber-400 font-medium whitespace-nowrap">{dept.name}</td>
                    <td className="py-2.5 text-gray-300">{dept.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Installation</h2>
            <div className="bg-[#0a0e1a] rounded-lg p-4 font-mono text-sm text-green-400 border border-green-900/30">
              $ {lib.installCmd}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Key Algorithms' && (
        <div className="space-y-4">
          {lib.algorithms.map((algo, i) => (
            <div key={i} className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
              <h3 className="text-base font-bold text-white mb-2">{algo.name}</h3>
              {algo.formula && (
                <div className="bg-[#0a0e1a] rounded-lg p-3 font-mono text-sm text-cyan-300 border border-cyan-900/30 mb-3">
                  {algo.formula}
                </div>
              )}
              <p className="text-gray-300 text-sm leading-relaxed">{algo.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Use in This Portal' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Portal Page References</h2>
          <div className="space-y-3">
            {lib.portalRefs.map((ref, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-[#0a0e1a] rounded-lg border border-[#1e2a45]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={ref.href} className="text-amber-400 font-medium text-sm hover:underline">
                      {ref.page}
                    </Link>
                    <span className="text-gray-600 text-xs font-mono">{ref.href}</span>
                  </div>
                  <p className="text-gray-400 text-xs">{ref.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Sample Notebooks' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Notebooks from Cloned Repository</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#1e2a45]">
                  <th className="text-left py-2 pr-6 font-medium">Notebook</th>
                  <th className="text-left py-2 pr-6 font-medium">Topic</th>
                  <th className="text-left py-2 font-medium">Key Formulas</th>
                </tr>
              </thead>
              <tbody>
                {lib.notebooks.map((nb, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50">
                    <td className="py-2.5 pr-6 text-amber-300 font-mono text-xs whitespace-nowrap">{nb.title}</td>
                    <td className="py-2.5 pr-6 text-gray-300">{nb.topic}</td>
                    <td className="py-2.5 text-gray-400 text-xs">{nb.formulas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-xs text-gray-600 font-mono">
            Clone path: /mnt/deepa/sohamyoga/oil-gas-integrations/{lib.name}/
          </div>
        </div>
      )}

      {activeTab === 'Integration Status' && (
        <div className="bg-[#0f1629] border border-[#1e2a45] rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Integration Status Tracker</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-[#1e2a45]">
                  <th className="text-left py-2 pr-6 font-medium">Feature</th>
                  <th className="text-left py-2 pr-6 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Implementation Detail</th>
                </tr>
              </thead>
              <tbody>
                {lib.integrationStatus.map((row, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50">
                    <td className="py-3 pr-6 text-gray-300 whitespace-nowrap">{row.feature}</td>
                    <td className="py-3 pr-6">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLES[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs font-mono">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
