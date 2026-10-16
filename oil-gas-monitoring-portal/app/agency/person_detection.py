"""YOLOX official ONNX person inference; no Torchvision dependency changes."""

import json
from datetime import datetime, timezone
import cv2
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageDraw
from app.analytics.catalog import DATA, ROOT
from app.agency.pipelines import CLIENT
from scripts.download_agency_data import bounded_get
from scripts.download_demo_data import sha256


def overlap(a, b):
    area = max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(
        0, min(a[3], b[3]) - max(a[1], b[1])
    )
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - area
    return area / max(union, 1e-9)


def infer(session, path):
    image = cv2.imread(str(path))
    height, width = image.shape[:2]
    ratio = min(416 / height, 416 / width)
    padded = np.full((416, 416, 3), 114, dtype=np.uint8)
    resized = cv2.resize(image, (int(width * ratio), int(height * ratio)))
    padded[: resized.shape[0], : resized.shape[1]] = resized
    inputs = np.ascontiguousarray(padded.transpose(2, 0, 1), dtype=np.float32)[None]
    raw = session.run(None, {session.get_inputs()[0].name: inputs})[0][0]
    grids = []
    strides = []
    for stride in (8, 16, 32):
        yy, xx = np.mgrid[: 416 // stride, : 416 // stride]
        grids.append(np.stack([xx, yy], axis=-1).reshape(-1, 2))
        strides.append(np.full((xx.size, 1), stride))
    grid = np.concatenate(grids)
    stride = np.concatenate(strides)
    center = (raw[:, :2] + grid) * stride
    size = np.exp(np.clip(raw[:, 2:4], -10, 10)) * stride
    xyxy = np.concatenate([center - size / 2, center + size / 2], axis=1) / ratio
    scores = raw[:, 4] * raw[:, 5]
    candidates = np.where(scores >= 0.4)[0]
    order = candidates[np.argsort(scores[candidates])[::-1]]
    kept = []
    for index in order:
        box = np.clip(xyxy[index] / np.array([width, height, width, height]), 0, 1)
        if all(overlap(box, other) < 0.45 for other in kept):
            kept.append(box.tolist())
        if len(kept) >= 30:
            break
    return kept


def run_person_detection():
    folder = ROOT / "data" / "models"
    folder.mkdir(parents=True, exist_ok=True)
    url = "https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_tiny.onnx"
    path = folder / "yolox_tiny.onnx"
    if not path.exists():
        bounded_get(url, path, 40 * 1024 * 1024)
    license_path = folder / "YOLOX_LICENSE.txt"
    if not license_path.exists():
        bounded_get(
            "https://raw.githubusercontent.com/Megvii-BaseDetection/YOLOX/main/LICENSE",
            license_path,
            100000,
        )
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(
        str(path), sess_options=options, providers=["CPUExecutionProvider"]
    )
    base = DATA / "ppe-images" / "content" / "css-data" / "test"
    paths = sorted((base / "images").glob("*.jpg"))[:24]
    tp = fp = fn = 0
    examples = []
    for index, source in enumerate(paths):
        boxes = infer(session, source)
        truth = []
        missing = []
        for line in (base / "labels" / (source.stem + ".txt")).read_text().splitlines():
            cls, cx, cy, w, h = map(float, line.split())
            box = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
            if int(cls) == 5:
                truth.append(box)
            elif int(cls) == 2:
                missing.append(box)
        used = set()
        for box in boxes:
            best = max(
                [(overlap(box, b), j) for j, b in enumerate(truth) if j not in used],
                default=(0, -1),
            )
            if best[0] >= 0.5:
                tp += 1
                used.add(best[1])
            else:
                fp += 1
        fn += len(truth) - len(used)
        if index < 3:
            with Image.open(source) as original:
                canvas = original.convert("RGB").resize((384, 384))
            draw = ImageDraw.Draw(canvas)
            for b in truth:
                draw.rectangle(tuple(v * 384 for v in b), outline="#45d9b2", width=3)
            for b in boxes:
                draw.rectangle(tuple(v * 384 for v in b), outline="#f2bc69", width=2)
            for b in missing:
                draw.rectangle(tuple(v * 384 for v in b), outline="#ee8295", width=2)
            output = CLIENT / "media"
            output.mkdir(parents=True, exist_ok=True)
            name = f"person-detection-{index}.png"
            canvas.save(output / name)
            examples.append(
                {
                    "file": name,
                    "caption": "Green: source Person boxes. Orange: model person predictions. Pink: source NO-Hardhat annotations, not model predictions.",
                }
            )
    metadata = {
        "model": "YOLOX-Tiny COCO official ONNX",
        "url": url,
        "sha256": sha256(path),
        "bytes": path.stat().st_size,
        "retrieved_at": datetime.now(timezone.utc).isoformat(),
        "documentation": "https://github.com/Megvii-BaseDetection/YOLOX/blob/main/demo/ONNXRuntime/README.md",
        "license_note": "YOLOX Apache-2.0 license saved locally; review COCO/source-image rights before redistribution.",
    }
    (folder / "manifest.json").write_text(json.dumps(metadata, indent=2) + "\n")
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    failed_path = CLIENT / "baselines" / "detection.json"
    experimental = (
        json.loads(failed_path.read_text()).get("metrics")
        if failed_path.exists()
        else None
    )
    return {
        "title": "Personnel detection with separate PPE annotation evidence",
        "mode": "recorded-data pretrained inference",
        "metrics": {
            "test_images": len(paths),
            "person_precision_iou_050": precision,
            "person_recall_iou_050": recall,
            "person_f1_iou_050": 2 * precision * recall / max(1e-9, precision + recall),
            "true_positives": tp,
            "false_positives": fp,
            "false_negatives": fn,
        },
        "media": examples,
        "model_source": metadata,
        "experimental_missing_helmet_grid_metrics": experimental,
        "limitations": [
            "The pretrained model detects people, not missing helmets, respirators or PPE compliance.",
            "Pink missing-helmet boxes are recorded ground truth and are never presented as model predictions.",
            "Small construction-proxy subset; possible COCO/source-image overlap was not audited.",
            "The separate scratch missing-helmet grid baseline failed evaluation and is not promoted.",
            "No cameras, tracking, safety actions, robot or flight control are connected.",
        ],
    }
