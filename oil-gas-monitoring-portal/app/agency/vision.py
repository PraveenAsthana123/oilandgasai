"""Offline image demonstrations with held-out evidence and explicit proxy limits."""

import json
from pathlib import Path
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import balanced_accuracy_score, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit
from app.analytics.catalog import DATA
from app.agency.pipelines import CLIENT


def picture(path, size=128):
    with Image.open(path) as source:
        return np.asarray(source.convert("RGB").resize((size, size)))


def features(image):
    x = image.astype(np.float32) / 255
    means = x.mean(axis=(0, 1))
    std = x.std(axis=(0, 1))
    hist = np.concatenate(
        [
            np.histogram(x[:, :, c], bins=8, range=(0, 1), density=True)[0]
            for c in range(3)
        ]
    )
    return np.concatenate([means, std, hist])


def drone():
    base = DATA / "aerial-scenes" / "content" / "sky_classification_export"
    records = [
        r
        for r in json.loads((base / "sky_classification_export.json").read_text())
        if isinstance(r.get("choice"), str)
    ][:1000]
    x = np.stack([features(picture(base / r["image"], 64)) for r in records])
    y = np.array([r["choice"] for r in records])
    groups = [Path(r["image"]).stem.split("Data0_")[-1].split("_")[0] for r in records]
    train, test = next(
        GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42).split(
            x, y, groups
        )
    )
    model = RandomForestClassifier(
        n_estimators=60,
        max_depth=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=2,
    ).fit(x[train], y[train])
    pred = model.predict(x[test])
    majority = max(set(y[train]), key=list(y[train]).count)
    output = CLIENT / "media"
    output.mkdir(parents=True, exist_ok=True)
    media = []
    for i in test[:3]:
        name = f"aerial-{i}.png"
        Image.fromarray(picture(base / records[i]["image"], 256)).save(output / name)
        media.append(
            {
                "file": name,
                "caption": f"Recorded aerial proxy · truth {y[i]} · predicted {model.predict(x[i:i+1])[0]}",
            }
        )
    return {
        "title": "Aerial scene classification",
        "mode": "recorded-data proxy",
        "metrics": {
            "train_images": len(train),
            "test_images": len(test),
            "balanced_accuracy": float(balanced_accuracy_score(y[test], pred)),
            "majority_balanced_accuracy": float(
                balanced_accuracy_score(y[test], [majority] * len(test))
            ),
            "overlapping_frame_groups": len(
                set(np.array(groups)[train]) & set(np.array(groups)[test])
            ),
        },
        "media": media,
        "labels": sorted(set(y)),
        "confusion_matrix": confusion_matrix(
            y[test], pred, labels=sorted(set(y))
        ).tolist(),
        "limitations": [
            "Urban aerial scene proxy; no inspected oil/gas assets or georeferenced flight data.",
            "Color-histogram random forest; source-frame groups held out, but not a new location/operator test.",
        ],
    }


def pixel_features(image):
    x = image.astype(np.float32) / 255
    gray = x.mean(axis=2)
    return np.concatenate(
        [x, gray[:, :, None], (x.max(axis=2) - x.min(axis=2))[:, :, None]], axis=2
    ).reshape(-1, 5)


def segmentation(kind):
    if kind == "segmentation":
        base = (
            DATA / "aerial-segmentation" / "content" / "Semantic segmentation dataset"
        )
        train_masks = sorted(
            p
            for p in base.glob("Tile */masks/*.png")
            if p.parents[1].name not in ["Tile 7", "Tile 8"]
        )[:30]
        test_masks = sorted((base / "Tile 8" / "masks").glob("*.png"))[:4]

        def image_for(mask):
            return next((mask.parents[1] / "images").glob(mask.stem + ".*"))

        title = "Aerial held-out-tile pixel segmentation"
    else:
        base = (
            DATA / "corrosion-segmentation" / "content" / "spalling_corrosion_patches"
        )
        train_masks = sorted((base / "train").glob("*_lab.png"))[:60]
        test_masks = sorted((base / "test").glob("*_lab.png"))[:6]

        def image_for(mask):
            return mask.with_name(mask.name.replace("_lab", ""))

        title = "Concrete-defect proxy pixel segmentation"
    if not train_masks or not test_masks:
        raise ValueError("No training/test mask pairs found")
    palette = set()

    def pair(mask):
        image = picture(image_for(mask), 128)
        with Image.open(mask) as source:
            labels = np.asarray(
                source.convert("RGB").resize((128, 128), Image.Resampling.NEAREST)
            )
        return image, labels

    for path in train_masks:
        _, labels = pair(path)
        palette.update(map(tuple, np.unique(labels.reshape(-1, 3), axis=0).tolist()))
    colors = np.array(sorted(palette), dtype=np.uint8)
    packed = (
        colors[:, 0].astype(int) * 65536
        + colors[:, 1].astype(int) * 256
        + colors[:, 2].astype(int)
    )

    def encode(labels):
        values = labels.reshape(-1, 3).astype(int)
        values = values[:, 0] * 65536 + values[:, 1] * 256 + values[:, 2]
        mapping = {int(v): i for i, v in enumerate(packed)}
        return np.array([mapping.get(int(v), -1) for v in values])

    rng = np.random.default_rng(42)
    x, y = [], []
    for path in train_masks:
        image, labels = pair(path)
        ids = rng.choice(128 * 128, 1000, replace=False)
        x.append(pixel_features(image)[ids])
        y.append(encode(labels)[ids])
    x, y = np.concatenate(x), np.concatenate(y)
    model = RandomForestClassifier(
        n_estimators=30,
        max_depth=12,
        class_weight="balanced",
        random_state=42,
        n_jobs=2,
    ).fit(x, y)
    matrix = np.zeros((len(colors), len(colors)), dtype=int)
    unknown = 0
    media = []
    out = CLIENT / "media"
    out.mkdir(parents=True, exist_ok=True)
    for index, path in enumerate(test_masks):
        image, labels = pair(path)
        actual = encode(labels)
        pred = model.predict(pixel_features(image))
        valid = actual >= 0
        unknown += int((~valid).sum())
        matrix += confusion_matrix(
            actual[valid], pred[valid], labels=np.arange(len(colors))
        )
        if index == 0:
            canvas = Image.new("RGB", (384, 128))
            canvas.paste(Image.fromarray(image), (0, 0))
            canvas.paste(Image.fromarray(labels), (128, 0))
            canvas.paste(Image.fromarray(colors[pred].reshape(128, 128, 3)), (256, 0))
            name = kind + "-triptych.png"
            canvas.resize((768, 256)).save(out / name)
            media.append(
                {
                    "file": name,
                    "caption": "Held-out source image | source mask | predicted mask",
                }
            )
    denominator = matrix.sum(0) + matrix.sum(1) - matrix.diagonal()
    valid = denominator > 0
    iou = np.divide(
        matrix.diagonal(),
        denominator,
        out=np.zeros(len(colors), dtype=float),
        where=valid,
    )
    majority = int(np.bincount(y).argmax())
    return {
        "title": title,
        "mode": "recorded-data proxy",
        "metrics": {
            "train_images": len(train_masks),
            "test_images": len(test_masks),
            "training_pixels": len(y),
            "pixel_accuracy": float(matrix.trace() / max(1, matrix.sum())),
            "mean_iou": float(iou[valid].mean()),
            "majority_pixel_accuracy": float(
                matrix.sum(1)[majority] / max(1, matrix.sum())
            ),
            "unseen_mask_color_pixels": unknown,
        },
        "media": media,
        "mask_classes": [
            {"rgb": c.tolist(), "iou": float(v)} for c, v in zip(colors, iou)
        ],
        "confusion_matrix": matrix.tolist(),
        "limitations": [
            "Color-feature random forest baseline, not a deep segmentation model.",
            "Palette class semantics are not verified: source class JSON colors differ from some masks.",
            "Concrete/aerial proxy; no claim of pipeline metal loss, certified inspection or calibrated GIS area.",
            "Aerial uses held-out tile; corrosion uses supplied train/test patches, which may share underlying scenes.",
        ],
    }
