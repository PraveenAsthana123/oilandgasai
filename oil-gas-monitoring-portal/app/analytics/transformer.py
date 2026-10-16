"""Small from-scratch feature transformer; no pretrained or safety claims."""
import torch
from torch import nn


class FeatureTransformer(nn.Module):
    def __init__(self, features):
        super().__init__()
        self.embed = nn.Linear(1, 16)
        self.position = nn.Parameter(torch.zeros(1, features, 16))
        self.encoder = nn.TransformerEncoder(nn.TransformerEncoderLayer(16, 2, 32, dropout=0,
                                            batch_first=True), num_layers=1, enable_nested_tensor=False)
        self.output = nn.Linear(16, 1)

    def forward(self, x):
        return self.output(self.encoder(self.embed(x.unsqueeze(-1)) + self.position)).squeeze(-1)


def train_reconstruction(train, test, path):
    torch.manual_seed(42)
    torch.set_num_threads(2)
    model = FeatureTransformer(train.shape[1])
    optimizer = torch.optim.Adam(model.parameters(), lr=.002)
    x = torch.tensor(train[:1000], dtype=torch.float32)
    y = torch.tensor(test[:300], dtype=torch.float32)
    for _ in range(3):
        model.train()
        for batch in x.split(64):
            optimizer.zero_grad()
            corrupted = batch + torch.randn_like(batch) * .1
            loss = nn.functional.mse_loss(model(corrupted), batch)
            loss.backward()
            optimizer.step()
    model.eval()
    with torch.no_grad():
        mse = nn.functional.mse_loss(model(y), y).item()
        baseline = (y ** 2).mean().item()
    torch.save(model.state_dict(), path)
    return {'method': 'FeatureTransformer denoising reconstruction', 'epochs': 3,
            'train_rows': len(x), 'test_rows': len(y), 'test_mse': mse,
            'training_mean_baseline_mse': baseline,
            'status': 'trained_from_scratch_experimental',
            'limitations': 'Numeric feature reconstruction, not temporal forecasting or a pretrained language model.'}
