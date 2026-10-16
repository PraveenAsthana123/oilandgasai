"""Small from-scratch localized NO-Hardhat grid detector; experimental only."""

import numpy as np
import torch
from torch import nn
from PIL import Image, ImageDraw
from app.analytics.catalog import DATA
from app.agency.pipelines import CLIENT


class GridDetector(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(
            nn.Conv2d(3, 12, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(12, 24, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(24, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.AdaptiveAvgPool2d((8, 8)),
            nn.Conv2d(32, 5, 1),
        )

    def forward(self, x):
        return self.network(x).permute(0, 2, 3, 1)


def load(split, limit):
    base = DATA / "ppe-images" / "content" / "css-data" / split
    xs, targets, truths, paths = [], [], [], []
    for path in sorted((base / "images").glob("*.jpg"))[:limit]:
        with Image.open(path) as image:
            xs.append(
                np.asarray(
                    image.convert("RGB").resize((96, 96)), dtype=np.float32
                ).transpose(2, 0, 1)
                / 255
            )
        target = np.zeros((8, 8, 5), dtype=np.float32)
        boxes = []
        for line in (base / "labels" / (path.stem + ".txt")).read_text().splitlines():
            values = list(map(float, line.split()))
            if int(values[0]) != 2:
                continue
            cx, cy, w, h = values[1:]
            col, row = min(7, int(cx * 8)), min(7, int(cy * 8))
            target[row, col] = [1, cx * 8 - col, cy * 8 - row, w, h]
            boxes.append([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2])
        targets.append(target)
        truths.append(boxes)
        paths.append(path)
    return torch.tensor(np.stack(xs)), torch.tensor(np.stack(targets)), truths, paths


def boxes(logits, threshold):
    result = []
    values = torch.sigmoid(logits).detach().numpy()
    for row in range(8):
        for col in range(8):
            score, dx, dy, w, h = map(float, values[row, col])
            if score >= threshold:
                cx, cy = (col + dx) / 8, (row + dy) / 8
                result.append(
                    {
                        "box": [
                            max(0, cx - w / 2),
                            max(0, cy - h / 2),
                            min(1, cx + w / 2),
                            min(1, cy + h / 2),
                        ],
                        "score": score,
                    }
                )
    return sorted(result, key=lambda p: -p["score"])[:10]


def iou(a, b):
    intersection = max(0, min(a[2], b[2]) - max(a[0], b[0])) * max(
        0, min(a[3], b[3]) - max(a[1], b[1])
    )
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - intersection
    return intersection / max(union, 1e-9)


def score(predictions, truths, threshold):
    tp = fp = fn = 0
    for logits, truth in zip(predictions, truths):
        used = set()
        for prediction in boxes(logits, threshold):
            choices = [
                (iou(prediction["box"], b), j)
                for j, b in enumerate(truth)
                if j not in used
            ]
            best = max(choices, default=(0, -1))
            if best[0] >= 0.3:
                tp += 1
                used.add(best[1])
            else:
                fp += 1
        fn += len(truth) - len(used)
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    return {
        "precision_iou_030": precision,
        "recall_iou_030": recall,
        "f1_iou_030": 2 * precision * recall / max(1e-9, precision + recall),
        "true_positives": tp,
        "false_positives": fp,
        "false_negatives": fn,
    }


def run_detection():
    torch.manual_seed(42)
    torch.set_num_threads(2)
    x, target, _, _ = load("train", 120)
    val, _, val_truth, _ = load("valid", 24)
    test, _, truth, paths = load("test", 24)
    model = GridDetector()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.002)
    for _ in range(15):
        model.train()
        for ids in torch.randperm(len(x)).split(24):
            logits = model(x[ids])
            t = target[ids]
            mask = t[:, :, :, 0] > 0
            loss = nn.functional.binary_cross_entropy_with_logits(
                logits[:, :, :, 0], t[:, :, :, 0], pos_weight=torch.tensor(8.0)
            )
            if mask.any():
                loss = loss + 5 * nn.functional.smooth_l1_loss(
                    torch.sigmoid(logits[:, :, :, 1:][mask]), t[:, :, :, 1:][mask]
                )
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
    model.eval()
    with torch.no_grad():
        valid_predictions = model(val)
        predictions = model(test)
    thresholds = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65]
    threshold = max(
        thresholds, key=lambda t: score(valid_predictions, val_truth, t)["f1_iou_030"]
    )
    metrics = score(predictions, truth, threshold)
    out = CLIENT / "media"
    out.mkdir(parents=True, exist_ok=True)
    selected = next((i for i, t in enumerate(truth) if t), 0)
    with Image.open(paths[selected]) as original:
        image = original.convert("RGB").resize((384, 384))
    draw = ImageDraw.Draw(image)
    for b in truth[selected]:
        draw.rectangle(tuple(v * 384 for v in b), outline="#38e5b4", width=3)
    for p in boxes(predictions[selected], threshold):
        draw.rectangle(tuple(v * 384 for v in p["box"]), outline="#ffb347", width=2)
    image.save(out / "ppe-detection.png")
    torch.save(model.state_dict(), CLIENT / "grid-detector.weights.pt")
    return {
        "title": "Localized missing-helmet grid detector",
        "mode": "recorded-data experiment",
        "metrics": metrics
        | {
            "train_images": len(x),
            "validation_images": len(val),
            "test_images": len(test),
            "epochs": 15,
            "chosen_threshold": threshold,
        },
        "media": [
            {
                "file": "ppe-detection.png",
                "caption": "Green: source NO-Hardhat boxes. Orange: model predictions. Experimental, IoU match threshold 0.30.",
            }
        ],
        "limitations": [
            "Tiny from-scratch single-class detector trained on bounded construction proxies.",
            "Threshold tuned on validation only; evaluation uses a small test subset and lenient IoU 0.30.",
            "No worker association, zone rules, tracking or safety-compliance inference.",
            "Weak or zero detection performance is displayed honestly; no model promotion.",
        ],
    }
