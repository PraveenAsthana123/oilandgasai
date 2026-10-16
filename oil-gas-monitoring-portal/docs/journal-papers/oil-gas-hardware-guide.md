# HARDWARE ENGINEER GUIDE
# AI-Based Monitoring Solution for Oil & Gas Industry

**Document Version**: 1.0
**Date**: December 2025
**Project Code**: OG-AI-MON-2025
**Audience**: Hardware Engineers, Embedded Systems Engineers, Field Technicians

---

# TABLE OF CONTENTS

1. [System Hardware Overview](#1-system-hardware-overview)
2. [Sensor Systems](#2-sensor-systems)
3. [Edge Computing Devices](#3-edge-computing-devices)
4. [Camera Systems](#4-camera-systems)
5. [Network Infrastructure](#5-network-infrastructure)
6. [Power Systems](#6-power-systems)
7. [Enclosures & Environmental](#7-enclosures--environmental)
8. [Installation Procedures](#8-installation-procedures)
9. [Calibration & Commissioning](#9-calibration--commissioning)
10. [Maintenance & Troubleshooting](#10-maintenance--troubleshooting)

---

# 1. SYSTEM HARDWARE OVERVIEW

## 1.1 Architecture Diagram

```
FIELD LEVEL                    EDGE LEVEL                 DATACENTER
============                   ==========                 ==========

+-------------+
| Vibration   |----+
| Sensors     |    |
+-------------+    |      +------------------+
                   +----->|                  |
+-------------+    |      |  Edge Gateway    |        +---------------+
| Temperature |----+      |  (Jetson AGX)    |        |               |
| Sensors     |    |      |                  |------->| Kubernetes    |
+-------------+    +----->| - Data Collect   |  MPLS  | Cluster       |
                   |      | - Feature Extract|   /    |               |
+-------------+    |      | - ML Inference   |  VPN   | - API Gateway |
| Pressure    |----+      | - Edge Storage   |        | - ML Services |
| Sensors     |           |                  |        | - Databases   |
+-------------+           +------------------+        +---------------+
                                 |
+-------------+                  |
| Flow        |------------------+
| Meters      |
+-------------+

+-------------+           +------------------+
| IP Cameras  |---------->| Video Analytics  |
| (FLIR/Axis) |           | Edge Node        |
+-------------+           +------------------+
```

## 1.2 Bill of Materials Summary

| Category | Item | Qty | Unit Cost | Total |
|----------|------|-----|-----------|-------|
| **Sensors** | | | | **$304,000** |
| | Vibration Sensor Kit | 200 | $850 | $170,000 |
| | Temperature Sensor | 200 | $120 | $24,000 |
| | Pressure Transmitter | 150 | $450 | $67,500 |
| | Flow Meter | 50 | $850 | $42,500 |
| **Edge Computing** | | | | **$360,000** |
| | Jetson AGX Orin 64GB | 20 | $2,199 | $43,980 |
| | Industrial Edge PC | 20 | $1,500 | $30,000 |
| | Edge Enclosure | 20 | $800 | $16,000 |
| | UPS (Edge) | 20 | $600 | $12,000 |
| | Installation Kit | 20 | $400 | $8,000 |
| **Cameras** | | | | **$540,000** |
| | Axis P1468-LE | 30 | $1,200 | $36,000 |
| | FLIR A70 Thermal | 30 | $4,500 | $135,000 |
| | GigE Vision Cables | 60 | $50 | $3,000 |
| | Camera Housing (ATEX) | 30 | $2,200 | $66,000 |
| **Servers** | | | | **$320,000** |
| | Dell R750xa (2xA100) | 4 | $65,000 | $260,000 |
| | Dell R650 (CPU) | 6 | $10,000 | $60,000 |
| **TOTAL** | | | | **$1,524,000** |

## 1.3 Hardware Selection Criteria

| Requirement | Specification | Rationale |
|-------------|---------------|-----------|
| ATEX/IECEx | Zone 1 rated | Hazardous area operation |
| Operating Temp | -40°C to +70°C | Outdoor/desert environments |
| IP Rating | IP66 minimum | Dust/water protection |
| EMC | IEC 61326-1 | Industrial immunity |
| Power | 24VDC nominal | Standard industrial supply |
| Communication | Modbus RTU/TCP, MQTT | Legacy + modern protocols |
| MTBF | >50,000 hours | Reliability requirement |

---

# 2. SENSOR SYSTEMS

## 2.1 Vibration Sensors

### Primary Specification

**Model**: PCB Piezotronics 682C09 (or equivalent)

| Parameter | Specification |
|-----------|---------------|
| Type | IEPE Accelerometer |
| Sensitivity | 100 mV/g |
| Frequency Range | 0.5 Hz to 14 kHz |
| Dynamic Range | 80 g peak |
| Temperature Range | -54°C to +121°C |
| Output | 4-20mA + HART |
| Housing | 316L Stainless Steel |
| Mounting | 1/4-28 UNF stud |
| Certification | ATEX/IECEx Zone 1 |

### Mounting Guidelines

```
VIBRATION SENSOR MOUNTING
=========================

MOTOR BEARING MONITORING:
                                    +---------+
    +---------------------------+   | Sensor  |
    |                           |   +---------+
    |    +-------+  +-------+   |       |
    |    |       |  |       |   |       V
    |    | DE    |  | NDE   |   |   Mount at 45deg
    |    | Brg   |  | Brg   |   |   to shaft axis
    |    +---+---+  +---+---+   |
    |        |          |       |
    |========|==========|=======|  Shaft
    |                           |
    +---------------------------+

Mounting Positions:
- Horizontal (H): Radial, 3 o'clock
- Vertical (V): Radial, 12 o'clock
- Axial (A): Along shaft centerline

Surface Preparation:
1. Clean mounting surface with isopropyl alcohol
2. Ensure flatness <0.001" per inch
3. Apply thin layer of silicone grease
4. Torque stud to 1.5 Nm (13 in-lb)
```

### Wiring Diagram

```
VIBRATION SENSOR WIRING (4-20mA + HART)
=======================================

               +24VDC
                 |
                 |
            +----+----+
            |         |
            |  250R   |  Precision resistor
            |  0.1%   |  for 1-5V output
            |         |
            +----+----+
                 |
                 +-------------> To ADC (1-5V)
                 |
            +----+----+
            |         |
            | SENSOR  |  PCB 682C09
            |         |
            +----+----+
                 |
                 |
                GND

Cable: Belden 8719 (shielded twisted pair)
Max Length: 300m
Shield: Ground at junction box only
```

### Sensor Data Acquisition

| Parameter | Value |
|-----------|-------|
| Sampling Rate | 25.6 kHz |
| Samples per Acquisition | 8192 |
| Acquisition Interval | 10 minutes |
| Data Format | 16-bit signed |
| Anti-aliasing Filter | 10 kHz (4th order Butterworth) |

## 2.2 Temperature Sensors

### Primary Specification

**Model**: Emerson 644H with RTD

| Parameter | Specification |
|-----------|---------------|
| Element | Pt100 RTD, Class A |
| Range | -200°C to +600°C |
| Accuracy | ±0.1°C |
| Output | 4-20mA + HART |
| Response Time | T90 < 3s (in water) |
| Housing | 316SS with thermowell |
| Process Connection | 1/2" NPT |
| Certification | ATEX/IECEx Zone 1 |

### Thermowell Selection

```
THERMOWELL SIZING
=================

Wake Frequency Check (API 2566):

        fs   >  1.25
        fn

Where:
- fs = vortex shedding frequency = (St × V) / d
- fn = natural frequency of thermowell
- St = Strouhal number (~0.22)
- V = flow velocity (m/s)
- d = tip diameter (m)

Example:
- Pipe: 6" NPS
- Flow: 3 m/s
- Thermowell: 6.35mm OD

fs = (0.22 × 3) / 0.00635 = 104 Hz
fn (standard) = 250 Hz
Ratio = 250/104 = 2.4 > 1.25  [PASS]
```

## 2.3 Pressure Transmitters

### Primary Specification

**Model**: Emerson 3051S

| Parameter | Specification |
|-----------|---------------|
| Range | 0-100 bar (configurable) |
| Accuracy | ±0.025% of span |
| Output | 4-20mA + HART |
| Process Connection | 1/2" NPT |
| Wetted Materials | 316SS diaphragm |
| Response Time | 100ms |
| Certification | ATEX/IECEx Zone 1, SIL 2 |

### Installation Requirements

```
PRESSURE TRANSMITTER INSTALLATION
=================================

LIQUID SERVICE:
                    Process Pipe
    ================|================
                    |
                    | Impulse line
                    | (slope down)
                    |
               +----+----+
               | Isolator|
               | Valve   |
               +----+----+
                    |
               +----+----+
               |   PT    |
               |  3051S  |
               +----+----+

- Mount transmitter BELOW tapping point
- Slope impulse line 1:12 minimum
- Use impulse line <15m length
- Vent at high point for gas service


GAS SERVICE:
                    Process Pipe
    ================|================
                    |
               +----+----+
               |   PT    |  Mount ABOVE
               |  3051S  |  tapping point
               +----+----+
                    |
                    | Impulse line
                    | (slope up)
                    |
               Condensate pot
               (if required)
```

## 2.4 Flow Meters

### Primary Specification

**Model**: Emerson Micro Motion F-Series

| Parameter | Specification |
|-----------|---------------|
| Type | Coriolis mass flow |
| Range | 0-50 kg/min |
| Accuracy | ±0.1% of rate |
| Output | 4-20mA + HART + Modbus |
| Process Connection | 2" ANSI 300# RF |
| Materials | 316L SS |
| Certification | ATEX/IECEx Zone 1, Custody Transfer |

---

# 3. EDGE COMPUTING DEVICES

## 3.1 NVIDIA Jetson AGX Orin 64GB

### Specifications

| Parameter | Specification |
|-----------|---------------|
| GPU | 2048 CUDA cores, 64 Tensor cores |
| CPU | 12-core Arm Cortex-A78AE |
| Memory | 64GB LPDDR5 |
| Storage | 64GB eMMC + NVMe slot |
| AI Performance | 275 TOPS (INT8) |
| Power | 15W - 60W (configurable) |
| Interfaces | GbE, USB 3.2, PCIe, GPIO |
| Operating Temp | -25°C to +80°C |

### Software Stack

```
JETSON SOFTWARE STACK
=====================

+------------------------------------------+
|            Application Layer             |
|  +------------+  +-------------------+   |
|  | Inference  |  | Video Analytics   |   |
|  | Service    |  | Service           |   |
|  +------------+  +-------------------+   |
+------------------------------------------+
|              Middleware                  |
|  +--------+  +--------+  +-----------+   |
|  | TensorRT| | DeepStream| | MQTT     |   |
|  | 8.6    |  | 6.3      |  | Client   |   |
|  +--------+  +--------+  +-----------+   |
+------------------------------------------+
|               JetPack 6.0                |
|  +--------+  +--------+  +------------+  |
|  | CUDA   |  | cuDNN  |  | OpenCV     |  |
|  | 12.2   |  | 8.9    |  | 4.8 (CUDA) |  |
|  +--------+  +--------+  +------------+  |
+------------------------------------------+
|          Ubuntu 22.04 (L4T)              |
+------------------------------------------+
|              Hardware                    |
+------------------------------------------+
```

### Power Configuration

```python
# Set power mode via nvpmodel
# Mode 0: MAXN (60W) - Maximum performance
# Mode 1: 30W - Balanced
# Mode 2: 15W - Power saving

# Check current mode
nvpmodel -q

# Set to 30W mode
sudo nvpmodel -m 1

# Set to maximum performance
sudo nvpmodel -m 0

# Enable all CPU cores
sudo jetson_clocks
```

### Thermal Management

```
THERMAL DESIGN
==============

Ambient Temp: -40°C to +55°C (target)
Jetson Limit: +97°C (thermal throttle)
Design Target: <85°C junction temp

Cooling Solution:
+---------------------------+
|   Active Heatsink         |
|   +-------------------+   |
|   |  80mm Fan         |   |  50 CFM @ 5000 RPM
|   +-------------------+   |
|   |  Aluminum Fins    |   |  Rth = 0.3 K/W
|   +-------------------+   |
|   |  Copper Base      |   |  Thermal paste: 5 W/mK
|   +-------------------+   |
|   |  Jetson Module    |   |
|   +-------------------+   |
+---------------------------+

Thermal Budget (60W mode, 55°C ambient):
- Junction temp = Ambient + (Power × Rth)
- Junction temp = 55 + (60 × 0.3) = 73°C < 85°C [OK]
```

## 3.2 Industrial Edge Gateway

### Specifications (Advantech UNO-2484G)

| Parameter | Specification |
|-----------|---------------|
| CPU | Intel Core i7-1185G7E |
| Memory | 32GB DDR4 |
| Storage | 512GB NVMe SSD |
| Expansion | 2x PCIe, 2x Mini-PCIe |
| I/O | 4x GbE, 4x USB, 4x COM |
| Power | 24VDC (10-30V range) |
| Operating Temp | -20°C to +60°C |
| Certification | UL, CE, FCC |

### I/O Configuration

```
EDGE GATEWAY I/O MAPPING
========================

COM Ports:
- COM1 (RS-485): Modbus RTU sensors
- COM2 (RS-485): Modbus RTU sensors
- COM3 (RS-232): Debug console
- COM4 (RS-232): Reserved

Ethernet Ports:
- ETH1: Field network (sensors, PLCs)
- ETH2: Uplink to datacenter
- ETH3: Camera network
- ETH4: Management/IPMI

GPIO (via PCIe expansion):
- DI 1-8: Digital inputs (24VDC)
- DO 1-4: Digital outputs (relay)
- AI 1-4: 4-20mA analog inputs
```

## 3.3 Edge Device Comparison

| Feature | Jetson AGX | Advantech UNO | Selection Criteria |
|---------|------------|---------------|-------------------|
| **Use Case** | AI Inference | Data Gateway | |
| GPU | 2048 CUDA | None | ML inference |
| AI Performance | 275 TOPS | N/A | Video analytics |
| Industrial I/O | Limited | Extensive | Sensor connectivity |
| Protocol Support | Limited | Modbus, OPC-UA | Legacy systems |
| Operating Temp | -25 to +80°C | -20 to +60°C | |
| Power | 15-60W | 35W | |
| Cost | $2,199 | $1,500 | |

**Recommendation**:
- Use Jetson AGX for: Video analytics, ML inference
- Use Advantech UNO for: Data aggregation, protocol conversion

---

# 4. CAMERA SYSTEMS

## 4.1 Visible Light Cameras

### Primary Specification (Axis P1468-LE)

| Parameter | Specification |
|-----------|---------------|
| Resolution | 8MP (3840x2160) |
| Frame Rate | 30 fps @ 4K |
| Lens | 4.3-8.6mm varifocal |
| Low Light | 0.03 lux (F1.0) |
| Compression | H.265, H.264, MJPEG |
| Interface | GigE (PoE+) |
| Operating Temp | -40°C to +60°C |
| IP Rating | IP66/IP67 |
| Certification | NEMA 4X |

### Camera Placement for PPE Detection

```
PPE DETECTION CAMERA PLACEMENT
==============================

Entry Point Monitoring:

        +-----------+
        |  Door     |
        |           |
        +-----------+
              |
              | 3-5m distance
              |
              V
        +-----+-----+
        |  Camera   |  Height: 2.5-3m
        |  Axis     |  Angle: 15-30 deg down
        |  P1468-LE |  FOV: Capture full body
        +-----------+

Field of View Calculation:
- Sensor: 1/1.8" (7.1mm × 5.3mm)
- Lens: 4.3mm
- Horizontal FOV = 2 × arctan(7.1 / (2 × 4.3)) = 79°
- At 5m: Coverage width = 2 × 5 × tan(79°/2) = 7.8m
```

## 4.2 Thermal Cameras

### Primary Specification (FLIR A70)

| Parameter | Specification |
|-----------|---------------|
| Resolution | 640×480 |
| Thermal Sensitivity | <30mK (NETD) |
| Temperature Range | -20°C to +650°C |
| Accuracy | ±2°C or ±2% |
| Frame Rate | 30 Hz |
| Lens | 24° × 18° FOV |
| Interface | GigE Vision |
| Operating Temp | -25°C to +50°C |
| Certification | ATEX Zone 2 (with housing) |

### Thermal Camera Applications

| Application | Configuration | Alarm Threshold |
|-------------|---------------|-----------------|
| Hot spot detection | Relative mode | +15°C above ambient |
| Gas leak imaging | OGI filter | N/A (visual) |
| Electrical fault | Spot meter | >70°C |
| Bearing overheat | ROI monitoring | >80°C |
| Fire detection | Rate of rise | >10°C/s |

## 4.3 ATEX Camera Housing

### Specification (Axis XF40-Q2901)

| Parameter | Specification |
|-----------|---------------|
| Material | 316L Stainless Steel |
| Window | Germanium (thermal), Glass (visible) |
| Certification | ATEX Zone 1, IECEx |
| IP Rating | IP66/IP68 |
| Operating Temp | -40°C to +65°C |
| Pressurization | Px purge available |

---

# 5. NETWORK INFRASTRUCTURE

## 5.1 Field Network Architecture

```
FIELD NETWORK TOPOLOGY
======================

Control Room                          Field Area
============                          ==========

+----------+                     +-------------+
| Core     |                     | Field       |
| Switch   |===== Fiber ========>| Switch      |
| (L3)     |     (SM, 10km)      | (L2)        |
+----------+                     +------+------+
                                        |
                              +---------+---------+
                              |         |         |
                         +----+---+ +---+----+ +--+-----+
                         | Edge   | | Edge   | | Edge   |
                         | GW 1   | | GW 2   | | GW 3   |
                         +----+---+ +---+----+ +--+-----+
                              |         |         |
                         +----+---+ +---+----+ +--+-----+
                         |Sensors| |Sensors| |Cameras|
                         +--------+ +--------+ +--------+
```

## 5.2 Industrial Ethernet Switch

### Specification (Cisco IE-4010)

| Parameter | Specification |
|-----------|---------------|
| Ports | 24x GbE + 4x 10G SFP+ |
| PoE | 30W per port (PoE+) |
| Redundancy | REP, MRP, PRP/HSR |
| Operating Temp | -40°C to +75°C |
| MTBF | 500,000 hours |
| Certification | Class 1 Div 2, ATEX Zone 2 |

### Network Segmentation

| VLAN | Name | Purpose | Subnet |
|------|------|---------|--------|
| 10 | Management | Switch management | 10.10.10.0/24 |
| 20 | Sensors | Field sensors | 10.10.20.0/24 |
| 30 | Cameras | Video streams | 10.10.30.0/24 |
| 40 | Edge | Edge devices | 10.10.40.0/24 |
| 50 | Uplink | Datacenter link | 10.10.50.0/24 |

## 5.3 Wireless Options

### Industrial WiFi (Cisco Aironet IW6300H)

| Parameter | Specification |
|-----------|---------------|
| Standard | WiFi 6 (802.11ax) |
| Frequency | 2.4/5/6 GHz |
| Data Rate | Up to 2.4 Gbps |
| Range | 150m (outdoor) |
| Operating Temp | -40°C to +70°C |
| Certification | Hazloc, IP67 |

### LoRaWAN (for remote sensors)

| Parameter | Specification |
|-----------|---------------|
| Frequency | 915 MHz (US) |
| Range | Up to 15km (LOS) |
| Data Rate | 0.3 - 50 kbps |
| Battery Life | 10+ years |
| Use Case | Remote well monitoring |

---

# 6. POWER SYSTEMS

## 6.1 Power Distribution

```
POWER DISTRIBUTION ARCHITECTURE
===============================

Main Panel (480VAC 3-phase)
           |
           V
    +------+------+
    |  UPS 10kVA  |
    |  (Online)   |
    +------+------+
           |
           V
    +------+------+
    | Distribution|  120/240VAC
    |    Panel    |
    +------+------+
           |
    +------+------+------+
    |      |      |      |
    V      V      V      V
+------+ +------+ +------+ +------+
| 24V  | | 24V  | | 48V  | | PoE  |
| PSU  | | PSU  | | PSU  | | Inj  |
| 10A  | | 10A  | | 5A   | | 30W  |
+------+ +------+ +------+ +------+
   |        |        |        |
Sensors  Sensors  Edge    Cameras
                  Nodes
```

## 6.2 Power Supply Selection

### 24VDC Power Supply

**Model**: Mean Well NDR-240-24

| Parameter | Specification |
|-----------|---------------|
| Output | 24VDC, 10A |
| Input | 90-264VAC |
| Efficiency | 93% |
| Operating Temp | -30°C to +70°C |
| Mounting | DIN rail |
| Protection | OVP, OCP, SCP |
| MTBF | 536,000 hours |

### Power Budget Calculation

```
POWER BUDGET - EDGE NODE CABINET
================================

Item                        Qty    Power(W)   Total(W)
--------------------------------------------------
Jetson AGX Orin            1      60         60
Advantech UNO-2484G        1      35         35
Industrial Switch          1      25         25
Vibration DAQ              2      15         30
Misc (fans, LEDs)          -      10         10
--------------------------------------------------
                           SUBTOTAL:         160W
                           Safety (25%):      40W
                           TOTAL:            200W

Power Supply Selection:
- Required: 200W @ 24V = 8.3A
- Selected: 24V/10A = 240W
- Margin: 40W (20% headroom) [OK]
```

## 6.3 UPS System

### Edge UPS Specification

**Model**: APC Smart-UPS SRT 1500VA

| Parameter | Specification |
|-----------|---------------|
| Capacity | 1500VA / 1350W |
| Input | 120VAC |
| Output | 120VAC, pure sine |
| Runtime | 7 min @ full load |
| Battery | Lead-acid (replaceable) |
| Interface | Network card, dry contacts |
| Operating Temp | 0°C to +40°C |

### Battery Runtime Calculation

```
BATTERY RUNTIME CALCULATION
===========================

Load: 200W
UPS: 1500VA, 1350W
Battery: 2 × 12V, 9Ah = 216Wh

Efficiency: 85%
Available energy = 216 × 0.85 = 184Wh

Runtime = 184Wh / 200W = 0.92 hours = 55 minutes

Note: Manufacturer states 7 min at full load (1350W)
At 200W (~15% load), expect ~45-60 min runtime
```

---

# 7. ENCLOSURES & ENVIRONMENTAL

## 7.1 ATEX/IECEx Zones

```
HAZARDOUS AREA CLASSIFICATION
=============================

Zone 0: Explosive atmosphere continuously present
        - Sensors only (IS barriers required)

Zone 1: Explosive atmosphere likely during normal operation
        - Sensors with Ex d or Ex e protection
        - Cameras in pressurized housings

Zone 2: Explosive atmosphere unlikely
        - Edge devices in suitable enclosures
        - Standard IP66 equipment acceptable

Safe Area: No explosive atmosphere expected
        - Standard equipment
        - Control room, datacenter
```

## 7.2 Enclosure Specifications

### Field Cabinet (Zone 2)

**Model**: Rittal CS 9783.500

| Parameter | Specification |
|-----------|---------------|
| Dimensions | 800W × 2000H × 400D mm |
| Material | Powder-coated steel |
| IP Rating | IP66 |
| Certification | ATEX Zone 2 |
| Climate Control | 500W cooling unit |
| Temp Range | -40°C to +50°C internal |

### Intrinsic Safety Barriers

**Model**: Pepperl+Fuchs KFD2-STC4-Ex1

| Parameter | Specification |
|-----------|---------------|
| Input | 4-20mA from field |
| Output | 4-20mA to safe area |
| Isolation | 2.5kV |
| Max Voltage | 28VDC |
| Ex Rating | [Ex ia] IIC |
| SIL | SIL 2 |

```
IS BARRIER CONNECTION
=====================

HAZARDOUS AREA           |    SAFE AREA
(Zone 1)                 |
                         |
+------------+      +----+----+      +----------+
| Field      |------|  IS     |------| Edge     |
| Sensor     |  Blue|  Barrier|      | Gateway  |
| (4-20mA)   |  Wire|  KFD2   |      | (ADC)    |
+------------+      +----+----+      +----------+
                         |
                         |
              Max 100m   |   Max 300m

Blue Wire: IS-rated cable (capacitance <100nF/km)
```

## 7.3 Environmental Protection

### IP66 Requirements

| Test | Method | Requirement |
|------|--------|-------------|
| Dust | IEC 60529 | No ingress |
| Water | Powerful jets | No harmful effects |
| Temp | IEC 60068-2 | -40°C to +70°C |
| Vibration | IEC 60068-2-6 | 10-150Hz, 2g |
| Shock | IEC 60068-2-27 | 30g, 11ms |

### Corrosion Protection

| Environment | Protection Level | Treatment |
|-------------|------------------|-----------|
| Offshore | C5-M (Very High) | 316L SS, epoxy coating |
| Desert | C4 (High) | Hot-dip galvanized + paint |
| Refinery | C4 (High) | Powder coat + sealant |

---

# 8. INSTALLATION PROCEDURES

## 8.1 Pre-Installation Checklist

```
PRE-INSTALLATION CHECKLIST
==========================

Site Survey:
[ ] Hazardous area classification confirmed
[ ] Power availability verified (voltage, phase, amps)
[ ] Network infrastructure reviewed
[ ] Mounting locations identified
[ ] Cable routing planned
[ ] Environmental conditions assessed
[ ] Permits obtained

Equipment:
[ ] All components received and inspected
[ ] Certificates verified (ATEX, calibration)
[ ] Firmware versions checked
[ ] Configuration files prepared
[ ] Spare parts available

Safety:
[ ] Work permit issued
[ ] Hot work permit (if required)
[ ] Confined space permit (if required)
[ ] LOTO procedure reviewed
[ ] PPE requirements confirmed
[ ] Emergency procedures briefed
```

## 8.2 Sensor Installation

### Vibration Sensor Installation

```
VIBRATION SENSOR INSTALLATION PROCEDURE
=======================================

1. Surface Preparation
   a. Clean mounting area with solvent
   b. Check surface flatness (<0.001" per inch)
   c. Mark mounting location

2. Drill and Tap
   a. Center punch location
   b. Drill pilot hole (5.1mm for 1/4-28 UNF)
   c. Tap threads (1/4-28 UNF, 12mm depth)
   d. Clean threads with compressed air

3. Mount Sensor
   a. Apply thin layer of silicone grease to base
   b. Thread sensor into mounting hole
   c. Hand tighten, then use wrench
   d. Torque to 1.5 Nm (13 in-lb)

4. Cable Connection
   a. Route cable through conduit
   b. Connect to junction box
   c. Verify polarity (signal +, signal -, shield)
   d. Ground shield at junction box only

5. Verification
   a. Check resistance (should be 2-3 ohms)
   b. Measure bias voltage (should be 8-12VDC)
   c. Tap sensor, verify signal response
   d. Record installation details

Documentation Required:
- Asset tag
- Sensor serial number
- Mounting location (drawing reference)
- Cable tag number
- Calibration certificate
- Photo of installation
```

## 8.3 Edge Device Installation

```
EDGE DEVICE INSTALLATION PROCEDURE
==================================

1. Cabinet Preparation
   a. Verify cabinet is properly grounded
   b. Install DIN rails and cable management
   c. Install power distribution block
   d. Install network patch panel

2. Power Installation
   a. Install 24VDC power supply on DIN rail
   b. Connect AC input (verify voltage)
   c. Set output to 24.0VDC (adjust if needed)
   d. Install UPS and connect battery

3. Network Installation
   a. Install industrial switch
   b. Connect fiber uplink (verify link light)
   c. Patch cables to panel
   d. Label all ports

4. Edge Device Installation
   a. Mount Jetson AGX on mounting plate
   b. Connect power (24VDC via DC-DC converter)
   c. Connect network cables
   d. Connect sensor interfaces

5. Cable Management
   a. Separate power and signal cables
   b. Use appropriate cable ties
   c. Label all cables at both ends
   d. Install strain reliefs

6. Power-Up Sequence
   a. Verify all connections
   b. Turn on AC power
   c. Verify 24VDC output
   d. Power on switch (wait for boot)
   e. Power on edge devices
   f. Verify network connectivity

7. Configuration
   a. Access device via SSH/console
   b. Apply network configuration
   c. Deploy application software
   d. Verify sensor data acquisition
   e. Test MQTT connectivity to cloud
```

---

# 9. CALIBRATION & COMMISSIONING

## 9.1 Sensor Calibration

### Vibration Sensor Calibration

```
VIBRATION SENSOR CALIBRATION
============================

Reference: ISO 16063-21

Equipment Required:
- Calibrated reference accelerometer
- Vibration exciter (shaker)
- Signal analyzer
- Calibration certificate traceable to NIST

Procedure:
1. Mount sensor on shaker (back-to-back with reference)
2. Apply sinusoidal excitation at 159.2 Hz (1000 rad/s)
3. Measure sensor output and reference output
4. Calculate sensitivity: S = V_out / a_ref
5. Compare to nominal sensitivity (100 mV/g ± 5%)
6. Record calibration data

Acceptance Criteria:
- Sensitivity: 95-105 mV/g
- Frequency response: ±3dB from 10Hz to 10kHz
- Cross-axis sensitivity: <5%

Calibration Interval: 12 months
```

### Temperature Sensor Calibration

```
TEMPERATURE SENSOR CALIBRATION
==============================

Reference: IEC 60751

Method: Comparison with reference PRT in dry-block calibrator

Calibration Points:
| Point | Temperature | Tolerance |
|-------|-------------|-----------|
| 1     | 0°C         | ±0.3°C    |
| 2     | 50°C        | ±0.3°C    |
| 3     | 100°C       | ±0.35°C   |
| 4     | 150°C       | ±0.4°C    |
| 5     | 200°C       | ±0.45°C   |

Procedure:
1. Insert sensor in dry-block calibrator
2. Allow stabilization (15 min per point)
3. Record 10 readings at 10-second intervals
4. Calculate mean and standard deviation
5. Compare to reference value
6. Apply correction if required

Calibration Interval: 24 months
```

## 9.2 System Commissioning

### Loop Check Procedure

```
LOOP CHECK PROCEDURE
====================

For each sensor-to-edge loop:

1. Field Verification
   [ ] Sensor tag matches P&ID
   [ ] Sensor range matches datasheet
   [ ] Cable routing per design
   [ ] Terminations tight and correct

2. Signal Injection
   [ ] Apply 4mA signal -> Verify 0% reading
   [ ] Apply 12mA signal -> Verify 50% reading
   [ ] Apply 20mA signal -> Verify 100% reading
   [ ] Record actual vs expected

3. Edge Device Verification
   [ ] Data appearing in edge gateway
   [ ] Engineering units correct
   [ ] Timestamp accurate (NTP synced)
   [ ] Data reaching cloud platform

4. Alarm Testing
   [ ] Trigger low alarm -> Verify alert
   [ ] Trigger high alarm -> Verify alert
   [ ] Clear alarm -> Verify reset

5. Documentation
   [ ] Complete loop check form
   [ ] Sign-off by field tech
   [ ] Sign-off by control room
   [ ] Update as-built drawings
```

### SAT (Site Acceptance Test)

```
SITE ACCEPTANCE TEST CHECKLIST
==============================

1. Infrastructure
   [ ] All equipment installed per design
   [ ] Power systems operational
   [ ] Network connectivity verified
   [ ] Environmental controls functional

2. Data Acquisition
   [ ] All sensors reading correctly
   [ ] Data rates as specified
   [ ] No data gaps >10 seconds
   [ ] Historical data accessible

3. ML Inference
   [ ] Models loaded on edge devices
   [ ] Inference latency <100ms
   [ ] Anomaly detection working
   [ ] Predictions matching expected

4. Alerts
   [ ] Critical alerts within 5 seconds
   [ ] Email notifications received
   [ ] SMS notifications received
   [ ] Dashboard updated

5. Performance
   [ ] CPU utilization <70%
   [ ] Memory utilization <80%
   [ ] Network bandwidth <50%
   [ ] Storage growth as expected

6. Documentation
   [ ] As-built drawings complete
   [ ] O&M manuals delivered
   [ ] Training completed
   [ ] Warranty registered
```

---

# 10. MAINTENANCE & TROUBLESHOOTING

## 10.1 Preventive Maintenance Schedule

| Component | Task | Frequency | Duration |
|-----------|------|-----------|----------|
| Sensors | Visual inspection | Monthly | 5 min/sensor |
| Sensors | Calibration check | Annually | 30 min/sensor |
| Edge devices | Firmware update | Quarterly | 1 hour |
| Edge devices | Log review | Weekly | 15 min |
| Cameras | Lens cleaning | Monthly | 10 min |
| Cameras | Focus verification | Quarterly | 20 min |
| Enclosures | Seal inspection | Quarterly | 10 min |
| Enclosures | Filter replacement | Quarterly | 15 min |
| Network | Cable inspection | Annually | 2 hours |
| UPS | Battery test | Monthly | 5 min |
| UPS | Battery replacement | 3-5 years | 1 hour |

## 10.2 Common Issues and Solutions

### Vibration Sensor Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| No signal | Cable break | Check continuity |
| No signal | Power issue | Verify 24VDC at sensor |
| Noisy signal | Ground loop | Check shield grounding |
| Noisy signal | EMI | Re-route cables |
| Drift | Loose mounting | Re-torque sensor |
| Drift | Temperature effect | Check temp compensation |
| Saturation | Overrange | Verify sensor range |

### Edge Device Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| No boot | Power failure | Check 24VDC, fuses |
| No boot | Corrupted OS | Re-flash from backup |
| High CPU | Runaway process | Restart service |
| High temp | Fan failure | Replace fan |
| High temp | Blocked airflow | Clean filters |
| No network | Cable/switch issue | Check LEDs, swap cable |
| No cloud connect | VPN issue | Restart VPN client |

### Diagnostic Commands

```bash
# Edge device diagnostics

# Check system status
systemctl status inference-service
systemctl status mqtt-client

# Check sensor data acquisition
journalctl -u data-acquisition -f

# Check network connectivity
ping -c 5 gateway.oilgas.internal
curl -s http://localhost:8080/health | jq

# Check GPU status (Jetson)
tegrastats
nvidia-smi

# Check disk usage
df -h
du -sh /var/log/*

# Check memory
free -h
top -bn1 | head -20

# Check temperatures
cat /sys/class/thermal/thermal_zone*/temp

# Test sensor connection
python3 -c "import serial; s=serial.Serial('/dev/ttyUSB0', 9600); print(s.read(100))"
```

## 10.3 Spare Parts Inventory

| Part | Qty | Location | Reorder Level |
|------|-----|----------|---------------|
| Vibration sensor PCB 682C09 | 10 | Warehouse | 5 |
| Temperature sensor Emerson 644H | 10 | Warehouse | 5 |
| Pressure transmitter Emerson 3051S | 5 | Warehouse | 2 |
| Jetson AGX Orin module | 2 | Site | 1 |
| Industrial switch Cisco IE-4010 | 1 | Site | 1 |
| UPS battery pack | 5 | Warehouse | 2 |
| 24VDC power supply 10A | 5 | Warehouse | 2 |
| Ethernet cable 10m | 20 | Site | 10 |
| Fiber patch cord 3m | 10 | Site | 5 |

---

# APPENDIX A: WIRING DIAGRAMS

## A.1 Sensor Junction Box

```
SENSOR JUNCTION BOX WIRING
==========================

Terminal Block Layout:
+------+------+------+------+------+------+------+------+
|  1   |  2   |  3   |  4   |  5   |  6   |  7   |  8   |
+------+------+------+------+------+------+------+------+
| VIB+ | VIB- | TEMP+| TEMP-| PRES+| PRES-| 24V+ | 24V- |
+------+------+------+------+------+------+------+------+
   |      |      |      |      |      |      |      |
   |      |      |      |      |      |      +------+----> To Power Supply
   |      |      |      |      +------+----------------> To Edge (AI3)
   |      |      +------+------------------------------> To Edge (AI2)
   +------+--------------------------------------------> To Edge (AI1)

Cable Colors (per IEC 60446):
- +24V: Red
- 0V/GND: Blue
- Signal+: White
- Signal-: Brown
- Shield: Green/Yellow
```

## A.2 Edge Cabinet Layout

```
EDGE CABINET LAYOUT (800x2000x400mm)
====================================

+----------------------------------+
|          Cable Entry             |
+----------------------------------+
|                                  |
|  +--------+    +--------+        |
|  | 24VDC  |    | 24VDC  |        |  Top Section
|  | PSU    |    | PSU    |        |  (Power)
|  +--------+    +--------+        |
|                                  |
|  +---------------------------+   |
|  |      UPS 1500VA           |   |
|  +---------------------------+   |
|                                  |
+----------------------------------+
|                                  |
|  +---------------------------+   |
|  |    Industrial Switch      |   |  Middle Section
|  |    Cisco IE-4010          |   |  (Network)
|  +---------------------------+   |
|                                  |
|  +------------+ +------------+   |
|  | Fiber      | | Patch      |   |
|  | Patch Panel| | Panel      |   |
|  +------------+ +------------+   |
|                                  |
+----------------------------------+
|                                  |
|  +---------------------------+   |
|  |    Jetson AGX Orin        |   |  Lower Section
|  |    with Heatsink          |   |  (Compute)
|  +---------------------------+   |
|                                  |
|  +---------------------------+   |
|  |    Advantech UNO-2484G    |   |
|  +---------------------------+   |
|                                  |
|  +---------------------------+   |
|  |    Sensor Interface       |   |
|  |    Terminal Blocks        |   |
|  +---------------------------+   |
|                                  |
+----------------------------------+
```

---

# APPENDIX B: REFERENCE DOCUMENTS

| Document | Number | Revision |
|----------|--------|----------|
| P&ID | OG-PID-001 | Rev C |
| Cable Schedule | OG-CAB-001 | Rev B |
| Loop Diagrams | OG-LOOP-001 | Rev B |
| Instrument Index | OG-INST-001 | Rev B |
| Hazardous Area Classification | OG-HAZ-001 | Rev A |
| Earthing Drawing | OG-EARTH-001 | Rev A |
| Network Architecture | OG-NET-001 | Rev B |

---

*END OF HARDWARE ENGINEER GUIDE*
