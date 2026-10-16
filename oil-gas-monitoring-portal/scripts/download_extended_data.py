"""Extend the existing collection without replacing its initial manifests."""
import json
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from scripts.download_demo_data import ROOT, download

SOURCES = [
    ('well-logs', 'sahasourav17/well-logs', 'well logs',
     'Petrophysical curve exploration, missing-log reconstruction and quality checks',
     'Depth samples are correlated; split by well before training. Missing/sentinel values and units require source review.'),
    ('well-facies', 'imeintanis/well-log-facies-dataset', 'well logs',
     'Lithology/facies classification from well-log measurements',
     'Facies labels are interpretations, not reserve estimates. Evaluate on held-out wells, not randomly mixed depths.'),
    ('drilling-gas-peaks', 'rramandixit/gaspeakofdrillingwell', 'drilling',
     'Exploratory drilling gas-peak patterns and advisory examples',
     'Small publisher dataset; not a validated kick detector or well-control system.'),
    ('reservoir-inventory', 'umarnabibhat/oil-reservoirs-dataset-of-venezuela', 'reservoir',
     'Reservoir/field inventory and comparative exploration',
     'Small publisher-curated regional inventory; verify provenance and units. Not a dynamic reservoir simulator or reserve certification.'),
    ('oil-spill-classification', 'sudhanshu2198/oil-spill-detection', 'oil spill',
     'Oil-spill classification benchmark using supplied tabular features',
     'Tabular feature benchmark, not automatically raw satellite imagery or real-time spill detection. Confirm feature and label semantics.'),
    ('oil-spill-incidents', 'warcoder/oil-spillage-data', 'oil spill',
     'Historical spill-event exploration and response planning examples',
     'Source coverage and reporting bias require review. Historical records cannot establish live emergency conditions.'),
    ('methane-emissions', 'kkhandekar/methane-emissions-across-the-world-19902018', 'methane emissions',
     'Country/sector methane trend exploration and reporting demos',
     'Aggregate historical emissions include non-oil/gas sectors. Filter only when actual sector fields support it; not facility leak localization.'),
    ('energy-market-prices', 'prasertk/historical-daily-oil-and-natural-gas-prices', 'oil price',
     'Oil/natural-gas historical price trends, volatility and forecasting backtests',
     'Historical prices require chronological validation and unit/currency review; not investment advice or live trading data.'),
    ('natural-gas-demand', 'alistairking/natural-gas-usage', 'natural gas consumption',
     'Historical gas consumption seasonality and demand forecasting',
     'Historical aggregate usage is not plant flow telemetry. Keep temporal splits and account for geography, seasonality and missing periods.'),
    ('volve-production', 'lamyalbert/volve-production-data', 'volve',
     'Well production, water-cut and decline-curve exploration where fields support it',
     'Kaggle lists a custom/Other license. Review source terms before redistribution or commercial use. Well status and time-series units need validation.'),
]


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    path = ROOT / 'manifest.json'
    previous = json.loads(path.read_text()) if path.exists() else {'datasets': []}
    records = {row['id']: row for row in previous['datasets']}
    failed = False
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs = [(source, pool.submit(download, source)) for source in SOURCES]
        for source, job in jobs:
            try:
                records[source[0]] = job.result()
            except Exception as exc:
                failed = True
                records[source[0]] = {'id': source[0], 'ref': source[1], 'status': 'failed',
                                      'error_type': type(exc).__name__}
                print(f'Download failed: {source[0]} ({type(exc).__name__})', flush=True)
    previous.update(retrieved_at=datetime.now(timezone.utc).isoformat(), datasets=list(records.values()))
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(previous, indent=2) + '\n')
    temp.replace(path)
    if failed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
