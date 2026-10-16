from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'data' / 'kaggle'
ARTIFACTS = ROOT / 'artifacts'
TITLES = {
    'pipeline-maintenance': 'Pipeline maintenance', 'pipeline-operations': 'Pipeline integrity',
    'pipeline-accidents': 'Pipeline incidents', 'production-trends': 'Production trends',
    'ppe-images': 'PPE vision', 'environmental-telemetry': 'Environmental telemetry',
    'machine-maintenance': 'Equipment maintenance', 'gas-sensor-drift': 'Gas sensor drift',
    'well-logs': 'Petrophysical well logs', 'well-facies': 'Well facies',
    'drilling-gas-peaks': 'Drilling gas peaks', 'reservoir-inventory': 'Reservoir inventory',
    'oil-spill-classification': 'Spill classification', 'oil-spill-incidents': 'Spill history',
    'methane-emissions': 'Methane emissions', 'energy-market-prices': 'Energy prices',
    'natural-gas-demand': 'Gas demand', 'volve-production': 'Volve well production',
}
TARGETS = {'pipeline-maintenance': 'Condition', 'pipeline-operations': 'Condition',
           'machine-maintenance': 'Failure Type', 'well-facies': 'Facies',
           'oil-spill-classification': 'target', 'gas-sensor-drift': 'gas_class'}


def catalog():
    items = []
    for key, title in TITLES.items():
        items.append({'id': key, 'title': title, 'dataset': key,
            'statistical': 'Distribution, missingness and robust deviation profiling',
            'ml': 'Random forest + majority baseline' if key in TARGETS else 'Isolation forest anomaly exploration',
            'cv': 'PPE image quality and supervised CNN' if key == 'ppe-images' else 'Not applicable: no image dataset in this module',
            'nlp': 'TF-IDF retrieval over local module/source/scenario documentation',
            'transformer': 'Small vision transformer' if key == 'ppe-images' else 'Numeric-feature transformer reconstruction',
            'release_status': 'Experimental offline baseline; not approved for plant decisions'})
    return items
