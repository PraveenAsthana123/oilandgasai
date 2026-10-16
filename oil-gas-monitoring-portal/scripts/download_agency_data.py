"""Additional client-demo sources; no executable upstream artifacts loaded."""

import json
import zipfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import PurePosixPath
import requests
from bs4 import BeautifulSoup
from scripts.download_demo_data import ROOT, download, sha256, profile
from app.analytics.catalog import ROOT as PROJECT

SOURCES = [
    (
        "aerial-scenes",
        "fxmikf/aerial-drone-urban-classification",
        "aerial drone urban classification",
        "Aerial scene classification and drone inspection context",
        "Urban aerial proxy; not oil/gas field footage or a navigation benchmark.",
    ),
    (
        "aerial-segmentation",
        "humansintheloop/semantic-segmentation-of-aerial-imagery",
        "aerial",
        "Land-cover segmentation for GIS/drone survey context",
        "Aerial imagery proxy; georeferencing and oil/gas asset labels not established.",
    ),
    (
        "corrosion-segmentation",
        "raidathmane/corrosion-and-spalling-concrete-defect-segmentation",
        "corrosion segmentation",
        "Supervised defect mask segmentation and inspection reporting",
        "Concrete corrosion/spalling proxy; not validated steel-pipeline corrosion or NDT.",
    ),
    (
        "logistics",
        "ziya07/smart-logistics-supply-chain-dataset",
        "asset management",
        "Supply-chain delay and inventory-risk exploration",
        "Publisher-curated generic logistics proxy; no actual client ERP or asset-criticality evidence.",
    ),
]
PUBLIC = PROJECT / "data" / "public"


def bounded_get(url, path, limit=100 * 1024 * 1024):
    size = 0
    with requests.get(url, stream=True, timeout=(15, 90)) as response:
        response.raise_for_status()
        with path.open("wb") as handle:
            for chunk in response.iter_content(1024 * 1024):
                size += len(chunk)
                if size > limit:
                    raise ValueError("Download budget exceeded")
                handle.write(chunk)


def uci(key, dataset_id, page, citation):
    base = PUBLIC / key
    base.mkdir(parents=True, exist_ok=True)
    response = requests.get(page, timeout=30)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    links = [
        a["href"]
        for a in soup.select("a[href]")
        if f"/static/public/{dataset_id}/" in a["href"] and ".zip" in a["href"]
    ]
    if not links:
        raise ValueError("No official dataset download found")
    url = requests.compat.urljoin(page, links[0])
    archive = base / "source.zip"
    bounded_get(url, archive)
    content = base / "content"
    content.mkdir(exist_ok=True)
    with zipfile.ZipFile(archive) as zipped:
        if sum(x.file_size for x in zipped.infolist()) > 300 * 1024 * 1024:
            raise ValueError("Archive expansion budget exceeded")
        for item in zipped.infolist():
            name = PurePosixPath(item.filename)
            if (
                name.is_absolute()
                or ".." in name.parts
                or "\\" in item.filename
                or (item.external_attr >> 16) & 0o170000 == 0o120000
            ):
                raise ValueError("Unsafe archive path")
        zipped.extractall(content)
    record = {
        "id": key,
        "source": page,
        "download_url": url,
        "citation": citation,
        "license": "CC BY 4.0 (official UCI page)",
        "source_mode": "recorded proxy",
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "files": [
            {
                "path": str(p.relative_to(PUBLIC)),
                "bytes": p.stat().st_size,
                "sha256": sha256(p),
                **profile(p),
            }
            for p in sorted(content.rglob("*"))
            if p.is_file()
        ],
    }
    record["archives"] = [
        {
            "path": str(archive.relative_to(PUBLIC)),
            "bytes": archive.stat().st_size,
            "sha256": sha256(archive),
        }
    ]
    (base / "manifest.json").write_text(json.dumps(record, indent=2) + "\n")
    return record


def main():
    records = json.loads((ROOT / "manifest.json").read_text())
    by_id = {r["id"]: r for r in records["datasets"]}
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs = [
            (s, pool.submit(download, s))
            for s in SOURCES
            if not (ROOT / s[0] / "manifest.json").exists()
        ]
        for source in SOURCES:
            manifest = ROOT / source[0] / "manifest.json"
            if manifest.exists():
                by_id[source[0]] = json.loads(manifest.read_text())
        for source, job in jobs:
            by_id[source[0]] = job.result()
    records["datasets"] = list(by_id.values())
    (ROOT / "manifest.json").write_text(json.dumps(records, indent=2) + "\n")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    datasets = [
        uci(
            "robot-navigation",
            194,
            "https://archive.ics.uci.edu/dataset/194/wall+following+robot+navigation+data",
            "Freire, Veloso & Barreto (2009), DOI 10.24432/C57C8W",
        ),
        uci(
            "iot-security",
            942,
            "https://archive.ics.uci.edu/dataset/942/rt-iot2022",
            "S. & Nagapadma (2023), DOI 10.24432/C5P338",
        ),
    ]
    documents = PUBLIC / "documents"
    documents.mkdir(exist_ok=True)
    for key, url in [
        (
            "equinor-volve",
            "https://raw.githubusercontent.com/equinor/industrial-hackathon-2026/main/ask-volve/README.md",
        ),
        (
            "epa-methane",
            "https://www.epa.gov/natural-gas-star-program/methane-emissions-data",
        ),
        (
            "phmsa-incidents",
            "https://www.phmsa.dot.gov/data-and-statistics/pipeline/distribution-transmission-gathering-lng-and-liquid-accident-and-incident-data",
        ),
    ]:
        raw = documents / (key + ".html")
        try:
            bounded_get(url, raw, 10 * 1024 * 1024)
        except requests.HTTPError as exc:
            datasets.append(
                {
                    "id": key,
                    "source": url,
                    "status": "download_blocked",
                    "http_status": exc.response.status_code,
                    "files": [],
                }
            )
            continue
        soup = BeautifulSoup(raw.read_text(errors="replace"), "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        main = soup.find("main") or soup.body or soup
        text = "\n".join(
            line.strip() for line in main.get_text("\n").splitlines() if line.strip()
        )
        if len(text) < 500:
            raise ValueError("Source document has insufficient extracted text")
        md = documents / (key + ".md")
        md.write_text(
            f"# Source snapshot: {key}\n\nSource: {url}\nRetrieved: {datetime.now(timezone.utc).isoformat()}\n\n"
            + text
        )
        datasets.append(
            {
                "id": key,
                "source": url,
                "type": "reference document snapshot",
                "files": [
                    {
                        "path": str(p.relative_to(PUBLIC)),
                        "bytes": p.stat().st_size,
                        "sha256": sha256(p),
                    }
                    for p in (raw, md)
                ],
            }
        )
    (PUBLIC / "manifest.json").write_text(
        json.dumps({"datasets": datasets}, indent=2) + "\n"
    )
    print("Additional Kaggle, UCI and reference sources downloaded.", flush=True)


if __name__ == "__main__":
    main()
