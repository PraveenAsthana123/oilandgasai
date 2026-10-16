# Oil & Gas AI Platform

Enterprise-grade AI/ML platform for the upstream, midstream, and downstream oil & gas industry. Built with Next.js 14, TypeScript, PostgreSQL, Ollama (local LLM), and integrations with 10 leading open-source O&G Python libraries.

## Platform Overview

| Portal | Port | Description |
|--------|------|-------------|
| [Operations Portal](./oil-gas-operations-portal) | 8384 | Upstream/Midstream/Downstream operations — 105 pages, 24 departments, AI/ML tools, BPM process flows |
| [Sales Portal](./oil-gas-sales-portal) | 8382 | Lead management, pricing engine (WTI/WCS/AECO), ROI calculator, AI proposal builder |
| [Admin Portal](./oil-gas-admin-portal) | 8383 | Regulatory compliance (AER/CER/ECCC), incident tracking (TRIF), AI governance, audit log |
| [Customer Portal](./oil-gas-customer-portal) | 8385 | Self-service — quality certs, asset monitoring, invoices (HST), production reports |
| [Vendor Portal](./oil-gas-vendor-portal) | 8386 | Vendor registration (WSIB/COR), performance KPIs, RFQ with Ollama, compliance tracking |
| [Monitoring Portal](./oil-gas-monitoring-portal) | 8805 | Flask API — PPE detection, pipeline integrity, IoT sensor analytics, RAG |

## Streams Covered

### Upstream
- Exploration & Seismic Interpretation
- Drilling Engineering (15-phase lifecycle, kill sheets, BHA design, DLS/MSE formulas)
- Reservoir Engineering (Arps DCA, material balance, Horner PTA, Archie's equation)
- Production Engineering
- Well Integrity
- HSE & Safety

### Midstream
- Pipeline Integrity & Corrosion Management
- Gas Compression (polytropic head calculations)
- Gas Processing (dew point, NGL extraction)
- Storage & Cavern Management
- SCADA & Control Systems
- Custody Transfer Metering (CTL×CPL×MF)

### Downstream
- Crude Distillation (CDU/VDU)
- FCC / Hydrocracking
- Blending & Quality Control (Watson K factor)
- Distribution & Logistics
- Crude Trading
- Environmental Compliance

## AI/ML Capabilities

- **Digital Twin** — Real-time asset mirroring with anomaly detection
- **IoT Sensors** — 16 real-time data streams, threshold alerting
- **Computer Vision** — PPE detection, pipeline corrosion image analysis
- **Image Classification** — Formation lithology from core images
- **Object Detection** — Equipment defect detection
- **Semantic Segmentation** — Seismic facies segmentation
- **Noise Cleaning** — Signal denoising for seismic/sensor data
- **Statistical ML** — Arps decline, regression, correlation analysis
- **RAG** — Document Q&A over O&G technical manuals (ChromaDB + Ollama)
- **Agentic AI** — Autonomous agents with human-review gates
- **ExpAI** — Explainability: SHAP, feature importance, decision traces
- **ResAI** — Responsible AI: bias audit, data provenance, consent controls
- **Conversational AI** — Ollama-powered portal chatbot with O&G context
- **Generative AI** — AI proposal drafting, report generation, release notes

## Open Source Integrations

10 leading O&G Python libraries cloned and integrated (see [oil-gas-integrations](./oil-gas-integrations)):

| Library | Stars | Domain | Key Use |
|---------|-------|--------|---------|
| [lasio](https://github.com/kinverarity1/lasio) | 404 | Petrophysics | LAS well log file I/O |
| [welly](https://github.com/agilescientific/welly) | 376 | Well Analysis | Log QC, normalization, correlation |
| [bruges](https://github.com/agilescientific/bruges) | 318 | Geoscience | Aki-Richards, Zoeppritz, Gassmann |
| [pyreservoir](https://github.com/yohanesnuwara/pyreservoir) | 179 | Reservoir Eng | Arps DCA, material balance, PVT |
| [pyscal](https://github.com/equinor/pyscal) | 66 | Reservoir Eng | Corey/LET relative permeability |
| [PEG_Python](https://github.com/orkahub/PEG_Python) | 84 | Education | DCA, AIML, reservoir simulation notebooks |
| [pytroleum](https://github.com/WaltXon/pytroleum) | 15 | Economics | Petroleum engineering economics |
| [seg/tutorials](https://github.com/seg/tutorials) | 152 | Seismic | SEG geophysics tutorials |
| oil-gas-portfolio | 2 | Production | Volve field decline curve analysis |
| Python-Pet-Eng | 15 | Reservoir | Flash calcs, fractional flow, pressure testing |

## Kaggle Datasets

Real datasets powering the analytics jobs:

| Dataset | Records | Used For |
|---------|---------|----------|
| Pipeline thickness loss | ~5K | Corrosion prediction, integrity scheduling |
| Predictive maintenance | ~10K | Equipment failure prediction, ROP optimization |
| IoT telemetry (CO/LPG/temp) | ~400K | Sensor anomaly detection, threshold alerting |
| Pipeline accidents (USA) | ~2K | Incident analysis, risk mapping |
| OGOR production trends | ~50K | Decline curve analysis, production forecasting |

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3
- **Backend**: Next.js API Routes, Node.js 20
- **Database**: PostgreSQL (auto-init via `CREATE TABLE IF NOT EXISTS`)
- **AI/LLM**: Ollama (llama3.2, local) — zero cloud API costs
- **Vector DB**: ChromaDB (RAG document retrieval)
- **Auth**: Session-based (HttpOnly cookies), bcrypt
- **Deployment**: Docker (standalone Next.js output)
- **Python Analytics**: Flask API (oil-gas-monitoring-portal)

## Quick Start

```bash
# Operations Portal (main)
cd oil-gas-operations-portal
cp .env.example .env   # set DATABASE_URL, OLLAMA_URL
npm install
npm run dev            # http://localhost:8384

# With Docker
docker build -t og-ops . && docker run -p 8384:8384 -e DATABASE_URL=... og-ops
```

## Canadian Regulatory Compliance

Built for the Western Canadian Sedimentary Basin (WCSB):
- **AER** Directive 056 (well completion), 020 (logging), 079 (resource applications), 008, 009, 050, 083
- **CER/NEB** — Federal jurisdiction pipelines
- **ECCC** — Environmental reporting
- **CAPP** — Industry best practices
- **WSIB/WCB** — Worker safety (vendor portal)
- **UNDRIP/FPIC** — Indigenous consultation workflows
- **HST 13%** — Canadian tax calculations
- **WCS/WTI differential** — Pricing engine

## Department Coverage (24 Departments)

Exploration Geology, Drilling Engineering, Reservoir Engineering, Production Engineering, HSE & Safety, Pipeline Integrity, Mechanical Maintenance, Instrument & Controls, Electrical Engineering, Process Engineering, SCADA & Automation, Environmental Compliance, Petroleum Economics, Data Science & AI, Logistics & Supply Chain, HR & Workforce, Finance & Accounting, Legal & Contracts, Regulatory Affairs, Quality Assurance, Project Management, Procurement, IT & Digital, Operations Management

---

*Built with Next.js 14, PostgreSQL, Ollama (llama3.2), ChromaDB — all infrastructure runs locally, zero cloud dependency.*
