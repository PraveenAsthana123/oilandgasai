# Additional oil and gas datasets and demo scenarios

Ten additional Kaggle datasets have been downloaded into `data/kaggle/`, preserving the initial eight datasets. Data is historical, publisher-curated or experimental; no additional inference service, streaming source or control integration was enabled.

## Dataset inventory

| Local folder | Contents inspected | Demo use cases | Data preparation / limits |
|---|---|---|---|
| well-logs | 28 files, including well measurements, deviation files and Wellheader | Log curve plots; missing-value and depth checks; deviation exploration; log reconstruction experiments | Identify actual file layouts, curve units and sentinel values before parsing. Split by well |
| well-facies | 3,232 rows; facies, formation, well name, depth, gamma ray, porosity and resistivity features | Facies classification; stratigraphic column; held-out-well generalization | Interpretation labels are not reserve estimates; keep wells separate across train/test |
| drilling-gas-peaks | CSV with 363 physical rows after first line, including extra headers and section rows | Gas-peak versus depth; composition comparisons; drilling advisory demonstrations | First line is a title, second has field names, third has units; remove section rows and blanks. Do not treat 363 as clean observation count |
| reservoir-inventory | 23 reservoir/field inventory rows with region, reserves, capacity and status | Inventory map; basin comparisons; data-quality and provenance review | Small publisher inventory; not independently verified reserves or a reservoir simulator |
| oil-spill-classification | 937 rows; 49 named feature columns and target | Imbalanced spill classification; precision/recall; threshold comparison | Anonymous feature names require semantic verification. This is tabular data, not raw satellite imagery |
| oil-spill-incidents | 277 rows; vessel/spill, location, dates, minimum/maximum tonnes and owner | Historical spill severity ranges; timeline; reporting completeness | Free-text dates and locations require cleaning; preserve min/max uncertainty |
| methane-emissions | 1,738 country-sector rows with annual values from 1990 through 2018 | Sector/country trends; oil/gas sector filtering when supported; reporting views | Preserve units; aggregate emissions are not facility leak detections |
| energy-market-prices | 23,024 rows; symbol, date, OHLC, volume and currency | Price/volatility charts; forecasting backtests; historical scenario replay | Group by symbol/currency and split chronologically; no trading or future-price guarantee |
| natural-gas-demand | 37,994 rows; area, product, process, year/month, value and units | Seasonal demand; regional comparisons; forecasting | Select consistent process/product/units; avoid aggregating incompatible series |
| volve-production | Excel: Daily Production Data (15,635 worksheet rows including header) and Monthly Production Data (528 worksheet rows including headers) | Well rates, oil/water/gas trends, water-cut, decline curves, pressure/temperature and injection analysis | Custom license review required. Check units, well types, zero/off-stream intervals and monthly sheet headers before calculations |

## Detailed additional demo plan

These scenarios describe possible implementations with downloaded data; they have not been trained or integrated into the UI automatically.

| ID | Scenario | Dataset / workflow | Acceptance and exception behavior |
|---|---|---|---|
| D23 | Facies identification | well-facies: classify facies using valid log features | Report per-class performance on held-out wells; flag unseen formations |
| D24 | Stratigraphic review | well-facies: show depth tracks, formation and facies per well | Depth ordering and labels remain traceable to original records |
| D25 | Missing log reconstruction | well-logs: mask known curve intervals in a separate test copy | Score only held-out known intervals; distinguish estimated from measured curves |
| D26 | Well-log quality | well-logs: inspect depth gaps, sentinel values, missing curves and units | No fabricated measurements; list parse errors and excluded rows |
| D27 | Drilling gas-peak review | drilling-gas-peaks: clean headers and plot total gas/components versus depth | Retain source-row mapping; no certified kick prediction or automatic well-control action |
| D28 | Reservoir inventory | reservoir-inventory: group inventory by basin/status and review reported capacities | Source/units visible; reported reserves are not verified or recomputed |
| D29 | Spill feature classification | oil-spill-classification: train baseline with stratified evaluation | Report minority-class recall, precision and confusion matrix; target is never an input |
| D30 | Historical spill comparison | oil-spill-incidents: compare spill tonnage ranges and dates | Preserve ranges and ambiguous dates; no artificial point estimate |
| D31 | Methane sector reporting | methane-emissions: filter actual sector values and plot annual trends | Sector/year/unit visible; avoid implying facility-level detection |
| D32 | Price scenario replay | energy-market-prices: chronological symbol-specific replay | Display historical status and currency; evaluate forecast against unseen future intervals |
| D33 | Gas demand forecast | natural-gas-demand: select a consistent series and compare seasonal baseline | Backtest chronological holdout; report missing months and MAE |
| D34 | Well production curves | volve-production: plot oil/gas/water by well and date | Correct flow/well type and unit handling; distinguish shut-in from missing data |
| D35 | Water-cut trend | volve-production: water divided by oil+water for compatible volume periods | Zero denominator is undefined, not zero water cut; no automatic intervention |
| D36 | Pressure/rate review | volve-production: correlate downhole/wellhead pressure, temperature and rates | Handle missing gauges and off-stream periods; correlation is not causal diagnosis |
| D37 | Decline-curve exploration | volve-production: fit a selected stable producing interval | State interval and model assumptions; no certified reserves or uncontrolled extrapolation |
| D38 | Injection versus production | volve-production: compare appropriate injector and producer histories | Align periods and well types; do not infer a causal reservoir response without engineering validation |

## Sources, licenses and reproducibility

Exact Kaggle source URLs, publisher license metadata, retrieval times, hashes and CSV profiles are saved in each folder's manifest. The collection source index is [kaggle-dataset-sources.md](kaggle-dataset-sources.md). Volve is flagged `Other (specified in description)`; downloading does not establish commercial permission. Attribution obligations remain applicable to CC BY sources.

After activating the canonical environment, run `python -m scripts.download_extended_data` to download current revisions and `python -m scripts.verify_demo_data` to verify the entire local collection. Existing dataset entries are preserved. Archived ZIPs and hashes identify the actual retrieved snapshots; current-revision downloads are not immutable version pins.
