# PlastiVision AI — GAN Model & T&E Framework Implementation

This module implements the **GAN Model paired with a Deep Learning Model** and its complete **Test and Evaluation (T&E)** suite in accordance with the official DoD CDAO guide:
> **"Test and Evaluation of Artificial Intelligence Models: What to Consider in a Test & Evaluation Strategy" (April 2024)**

---

## 1. Architecture Overview: GAN + Deep Learning Classifier

```
                            ┌────────────────────────────────────────────────────────┐
                            │                      GAN Engine                        │
                            │  1. Conditional DCGAN:                                 │
                            │     z ~ N(0, I) + class y ──► Synthetic Waste Images   │
                            │                                                        │
                            │  2. AdvGAN Perturbation Generator:                    │
                            │     Image x ──► Perturbation δ ∈ [-ε, ε] ──► x_adv     │
                            └───────────────────────────┬────────────────────────────┘
                                                        │
                                                        ▼
                            ┌────────────────────────────────────────────────────────┐
                            │          Downstream Deep Learning Classifier           │
                            │          (Vision Transformer / Custom CNN)             │
                            │                                                        │
                            │  Inputs: Real Test Images, GAN Synthetic, x_adv        │
                            │  Outputs: P(Biodegradable), P(Non-Biodegradable)       │
                            │           Confidence & Shannon Entropy                 │
                            └────────────────────────────────────────────────────────┘
```

### Components Built:
1. **Conditional DCGAN ([gan/model.py](file:///d:/amrita/sem7/nn/plastiVision/gan/model.py))**:
   - Generator: Transposed Convolutional network with BatchNorm and Tanh output generating images conditioned on class label `y ∈ {0: Biodegradable, 1: Non-Biodegradable}`.
   - Discriminator: Strided Convolutional network with LeakyReLU evaluating real vs. synthetic image validity.
   - Solves dataset class imbalance by synthesizing edge-case samples.
2. **AdvGAN Perturbation Generator ([gan/model.py](file:///d:/amrita/sem7/nn/plastiVision/gan/model.py))**:
   - Encoder-Decoder network generating bounded adversarial perturbations $\delta \in [-\epsilon, \epsilon]$.
   - Employs residual feature extraction to stress-test the downstream deep learning classifier.
3. **Downstream Deep Learning Classifier ([backend/models/vit_model.py](file:///d:/amrita/sem7/nn/plastiVision/backend/models/vit_model.py))**:
   - Vision Transformer / Custom CNN evaluating classification correctness, confidence calibration, and entropy under clean, synthetic, and perturbed conditions.

---

## 2. Mapping to the T&E Framework Document

| T&E Framework Section & Page | Framework Requirement | Implementation in PlastiVision AI |
| :--- | :--- | :--- |
| **Focus Area 1: AI Model T&E** *(Page 5 & 40-54)* | Evaluate model performance across functional dimensions in isolation. | Precision, Recall, Macro F1-score, and Loss computed across clean vs. GAN synthetic vs. perturbed datasets. |
| **Focus Area 2: Systems Integration (SI)** *(Page 5 & 18)* | Evaluate the AI component within the larger system to ensure holistic unit functionality. | Integrated into Flask REST API (`/api/gan/metrics`, `/api/gan/generate`, `/api/gan/adversarial`). |
| **Focus Area 3: Operational T&E (OT&E)** *(Page 5 & 13)* | Realistic operational stress testing. | Robustness curves across perturbation budget sweep ($\epsilon \in [0.00, 0.20]$). |
| **Focus Area 4: Human Systems Integration (HSI)** *(Page 5 & 15)* | Support operator decisions and transparency. | Uncertainty quantification via Shannon Entropy: flags ambiguous cases ($H > 0.45$) for human-in-the-loop sorting. |
| **The "Performance Iceberg"** *(Page 9-18)* | Look beneath the waterline (Correctness is just the tip). | Evaluates Robustness (P.13), Uncertainty (P.15), and Latency (P.18). |
| **Adversarial Testing & Red Teaming** *(Page 22)* | Probing model vulnerabilities using adversarial attacks. | AdvGAN generates adversarial perturbations measuring Attack Flip Rate. |
| **Documentation & Model Cards** *(Page 59-64)* | Version-controlled, reproducible documentation. | Automated export of `gan_te_evaluation_report.json` and `gan_te_report.md`. |

---

## 3. How to Run the T&E Evaluation Suite

### Run the Evaluation & Generate Artifacts:
```powershell
.\.venv\Scripts\python gan/evaluate_te.py --num-samples 100
```

### Outputs Generated in `gan/evaluation_results/`:
* `gan_te_evaluation_report.json`: Machine-readable benchmarks and compliance parameters.
* `gan_te_report.md`: Markdown summary ready for reports and presentations.
* `adversarial_robustness_curve.png`: Epsilon perturbation vs. Accuracy and Flip Rate curve.
* `gan_synthetic_samples.png`: Grid of GAN-generated waste samples.

### Train the GAN on the Dataset:
```powershell
.\.venv\Scripts\python gan/train_gan.py --epochs 5 --batch-size 32
```

---

## 4. REST API Endpoints

* **`GET /api/gan/status`**: Verification of pipeline readiness and architecture.
* **`GET /api/gan/metrics`**: Returns full T&E framework test results and robustness metrics.
* **`POST /api/gan/generate`**: Synthesizes a waste image on demand (JSON body: `{"class_label": 0}` for Bio, `{"class_label": 1}` for Non-Bio).
* **`POST /api/gan/adversarial-test`**: Upload an image to test prediction before and after GAN perturbation.
