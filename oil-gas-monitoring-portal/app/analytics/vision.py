"""PPE image-level missing-helmet baselines. Not bounding-box detectors."""
from collections import Counter
import numpy as np
import torch
from PIL import Image
from sklearn.metrics import balanced_accuracy_score, confusion_matrix
from torch import nn
from app.analytics.catalog import DATA


class HelmetCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.network = nn.Sequential(nn.Conv2d(3, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(), nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(16, 2))

    def forward(self, x):
        return self.network(x)


class HelmetViT(nn.Module):
    def __init__(self):
        super().__init__()
        self.patch = nn.Conv2d(3, 16, kernel_size=16, stride=16)
        self.position = nn.Parameter(torch.zeros(1, 16, 16))
        self.encoder = nn.TransformerEncoder(nn.TransformerEncoderLayer(16, 2, 32, dropout=0,
            batch_first=True), 1, enable_nested_tensor=False)
        self.head = nn.Linear(16, 2)

    def forward(self, x):
        patches = self.patch(x).flatten(2).transpose(1, 2) + self.position
        return self.head(self.encoder(patches).mean(1))


def samples(base, split, limit):
    images, labels, paths = [], [], []
    for path in sorted((base / split / 'images').glob('*.jpg'))[:limit]:
        annotation = base / split / 'labels' / (path.stem + '.txt')
        classes = [int(line.split()[0]) for line in annotation.read_text().splitlines() if line.strip()]
        with Image.open(path) as image:
            images.append(np.asarray(image.convert('RGB').resize((64, 64)), dtype=np.float32).transpose(2, 0, 1) / 255)
        labels.append(int(2 in classes))
        paths.append(str(path.relative_to(DATA)))
    return torch.tensor(np.stack(images)), torch.tensor(labels), paths


def run_vision(output):
    torch.manual_seed(42)
    torch.set_num_threads(2)
    base = DATA / 'ppe-images' / 'content' / 'css-data'
    counts = Counter()
    annotations = 0
    for path in base.glob('*/labels/*.txt'):
        for line in path.read_text().splitlines():
            if line.strip():
                counts[int(line.split()[0])] += 1
        annotations += 1
    train, train_y, train_paths = samples(base, 'train', 160)
    test, test_y, test_paths = samples(base, 'test', 80)
    result = {}
    for name, model in [('cnn', HelmetCNN()), ('vision_transformer', HelmetViT())]:
        optimizer = torch.optim.Adam(model.parameters(), lr=.002)
        for _ in range(2):
            model.train()
            for indexes in torch.randperm(len(train)).split(32):
                optimizer.zero_grad()
                loss = nn.functional.cross_entropy(model(train[indexes]), train_y[indexes])
                loss.backward()
                optimizer.step()
        model.eval()
        with torch.no_grad():
            predictions = model(test).argmax(1).numpy()
        result[name] = {'balanced_accuracy': float(balanced_accuracy_score(test_y, predictions)),
            'confusion_matrix': confusion_matrix(test_y, predictions, labels=[0, 1]).tolist(),
            'epochs': 2, 'status': 'trained_from_scratch_experimental'}
        torch.save(model.state_dict(), output / f'{name}.weights.pt')
    majority = int(torch.bincount(train_y).argmax())
    return {'status': 'completed_experimental', 'task': 'Image-level presence of NO-Hardhat annotation',
        'train_rows': len(train), 'test_rows': len(test), 'split': 'Original train/test folders; bounded alphabetical subsets',
        'class_counts': dict(counts), 'annotation_files': annotations,
        'majority_baseline_balanced_accuracy': float(balanced_accuracy_score(test_y, np.full(len(test), majority))),
        'cv': result['cnn'], 'transformer': result['vision_transformer'],
        'statistical': {'image_count': len(list(base.glob('*/images/*.jpg'))),
                        'test_missing_helmet_prevalence': float(test_y.float().mean())},
        'data_provenance': {'train_paths': train_paths, 'test_paths': test_paths},
        'limitations': ['Image-level proxy classification only; no worker association or bounding-box detector.',
                       'Absence of NO-Hardhat annotation does not establish PPE compliance.',
                       'Small subsets and two epochs are smoke baselines, not site-ready accuracy.',
                       'Upstream .pt models and notebooks were not executed.']}
