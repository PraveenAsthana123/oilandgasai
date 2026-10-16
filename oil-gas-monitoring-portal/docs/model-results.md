# Actual offline baseline results

All results below are bounded experimental runs on historical/proxy datasets. They do not establish plant readiness. Full per-module reports, splits and saved weights are in artifacts/. Transformer MSE is in standardized feature space and should not be compared between modules.

| Module | ML evaluation | Transformer evaluation |
|---|---|---|
| Pipeline maintenance | Balanced accuracy 0.994; majority 0.333; macro F1 0.995 | Reconstruction MSE 0.059; mean baseline 1.039 |
| Pipeline integrity | Balanced accuracy 0.997; majority 0.333; macro F1 0.997 | Reconstruction MSE 0.035; mean baseline 1.040 |
| Pipeline incidents | 21 anomaly flags / 699 held-out rows; no labeled accuracy | Reconstruction MSE 0.178; mean baseline 0.445 |
| Production trends | 473 anomaly flags / 1250 held-out rows; no labeled accuracy | Reconstruction MSE 0.102; mean baseline 1.113 |
| PPE vision | CNN balanced accuracy 0.476; majority 0.500 | ViT balanced accuracy 0.500 |
| Environmental telemetry | 268 anomaly flags / 1250 held-out rows; no labeled accuracy | Reconstruction MSE 0.008; mean baseline 0.759 |
| Equipment maintenance | Balanced accuracy 0.528; majority 0.167; macro F1 0.477 | Reconstruction MSE 0.054; mean baseline 0.957 |
| Gas sensor drift | Balanced accuracy 0.582; majority 0.167; macro F1 0.579 | Reconstruction MSE 0.049; mean baseline 0.779 |
| Petrophysical well logs | 414 anomaly flags / 1298 held-out rows; no labeled accuracy | Reconstruction MSE 0.122; mean baseline 1.664 |
| Well facies | Balanced accuracy 0.430; majority 0.111; macro F1 0.331 | Reconstruction MSE 0.179; mean baseline 1.655 |
| Drilling gas peaks | 85 anomaly flags / 86 held-out rows; no labeled accuracy | Reconstruction MSE 4.305; mean baseline 6.612 |
| Reservoir inventory | 0 anomaly flags / 6 held-out rows; no labeled accuracy | Reconstruction MSE 0.179; mean baseline 0.954 |
| Spill classification | Balanced accuracy 0.598; majority 0.500; macro F1 0.644 | Reconstruction MSE 0.106; mean baseline 0.846 |
| Spill history | 25 anomaly flags / 70 held-out rows; no labeled accuracy | Reconstruction MSE 0.955; mean baseline 1.066 |
| Methane emissions | 0 anomaly flags / 435 held-out rows; no labeled accuracy | Reconstruction MSE 0.000; mean baseline 0.072 |
| Energy prices | 661 anomaly flags / 1250 held-out rows; no labeled accuracy | Reconstruction MSE 1.104; mean baseline 1.955 |
| Gas demand | 1126 anomaly flags / 1250 held-out rows; no labeled accuracy | Reconstruction MSE 0.925; mean baseline 2.644 |
| Volve well production | 484 anomaly flags / 1250 held-out rows; no labeled accuracy | Reconstruction MSE 0.063; mean baseline 0.987 |
