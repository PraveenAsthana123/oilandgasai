export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const KNOWLEDGE = [
  { source: 'scada-architecture', content: 'SCADA (Supervisory Control and Data Acquisition) architecture for oil and gas: field devices (sensors, actuators) → RTUs/PLCs (remote/programmable logic controllers) → communications network (fiber, cellular, satellite) → master terminal unit (MTU) → HMI/historian. Key standards: IEC 61511 (safety instrumented systems), IEC 61512 (batch control).' },
  { source: 'modbus-opc-ua', content: 'Modbus RTU/TCP is the legacy field protocol (serial, limited addressing, widely deployed). OPC-UA (Unified Architecture) is the modern standard: platform-independent, secure, supports complex data types and publish-subscribe. OPC-DA (legacy) runs on DCOM. Migration from Modbus to OPC-UA improves interoperability and security posture.' },
  { source: 'historian-systems', content: 'Process historians store time-series data at high resolution (1-second intervals). Major vendors: OSIsoft PI, Honeywell PHD, AspenTech IP.21. Historians support compression algorithms (swinging door, boxcar-backslope) to reduce storage while preserving accuracy. Retrieval via PI AF, REST APIs, or SQL interfaces for analytics.' },
  { source: 'alarm-management-isa18', content: 'ISA-18.2 defines alarm management lifecycle: rationalization, basic alarm design, HMI, monitoring, control, MOC, audit, enforcement. Key KPIs: alarm rate < 1 alarm/10 min (manageable), < 10 alarms/10 min (very likely acceptable), > 20 alarms/10 min (overloaded). Alarm floods are defined as > 10 alarms per minute.' },
  { source: 'cybersecurity-iec62443', content: 'IEC 62443 is the industrial cybersecurity standard for IACS (Industrial Automation and Control Systems). Defines security levels SL1-SL4. Key zones: enterprise, DMZ, control, field. Air-gapping vs. unidirectional security gateways (data diodes). NERC CIP applies for bulk electric systems; API 1164 for pipeline SCADA.' },
  { source: 'real-time-monitoring', content: 'Real-time SCADA monitoring for pipelines: pressure (MAWP ± 5%), flow rate (custody accuracy ±0.25%), temperature (±0.5°C for gas quality), valve position, compressor status. Leak detection via mass balance or pressure wave analysis. LNAPL/DNAPL sensors for contamination monitoring at storage facilities.' },
  { source: 'dcs-vs-plc', content: 'DCS (Distributed Control System) vs PLC (Programmable Logic Controller): DCS designed for continuous process control (refineries, LNG plants), tight integration with process historian, redundant controllers. PLC designed for discrete/sequential logic (compressor stations, valve control), faster scan rates (1-10ms), modular I/O. Modern systems blur the distinction via PAC (Process Automation Controllers).' },
  { source: 'hmi-design', content: 'High-performance HMI design principles (ASM Consortium guidelines): grayscale base with color for alarms only, no 3D effects, alarm acknowledgment workflows, effective alarm prioritization (1=critical, 2=high, 3=medium, 4=low). Overview → unit → detail → diagnostic navigation hierarchy. Situational awareness requires clear process flow indication and abnormal situation highlighting.' },
  { source: 'iot-telemetry-anomaly', content: 'IoT sensor anomaly detection thresholds for oil/gas facilities: CO (carbon monoxide) > 0.006 ppm indicates potential combustion issue or gas leak. LPG > 0.007 indicates hydrocarbon vapor concentration near LEL (lower explosive limit). Humidity > 0.8 can indicate condensation affecting sensor accuracy. Temp spikes > 3 standard deviations from baseline indicate equipment overheating.' },
  { source: 'scada-redundancy', content: 'SCADA redundancy architectures: warm standby (manual switchover, minutes RTO), hot standby (automatic, seconds RTO), active-active (load-balanced, sub-second). Communications redundancy: primary fiber + backup cellular/satellite. RTU battery backup for 8-24 hours. UPS for control room. Geographic redundancy for disaster recovery with RPO < 1 hour.' },
];

async function ensureTable(client: import('pg').PoolClient) {
  await client.query(`CREATE TABLE IF NOT EXISTS ogo_rag_chunk (id SERIAL PRIMARY KEY, dept TEXT, source TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`);
}

export async function GET() {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const res = await client.query(`SELECT COUNT(*) AS cnt FROM ogo_rag_chunk WHERE dept='midstream-scada-control'`);
    return NextResponse.json({ status: 'ok', chunks_seeded: parseInt(res.rows[0].cnt, 10) });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}

export async function POST(_req: NextRequest) {
  const client = await pool.connect();
  try {
    await ensureTable(client);
    await client.query(`DELETE FROM ogo_rag_chunk WHERE dept='midstream-scada-control'`);
    for (const chunk of KNOWLEDGE) {
      await client.query(`INSERT INTO ogo_rag_chunk (dept, source, content) VALUES ($1,$2,$3)`, ['midstream-scada-control', chunk.source, chunk.content]);
    }
    return NextResponse.json({ status: 'ok', chunks_created: KNOWLEDGE.length });
  } catch (e: unknown) { return NextResponse.json({ status: 'error', error: String(e) }); }
  finally { client.release(); }
}
