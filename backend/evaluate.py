"""
PlastiVision AI — Model Evaluation Script
==========================================
Usage (run after training):
    cd backend
    python evaluate.py

Generates in saved_model/evaluation/:
  - classification_report.txt
  - confusion_matrix.png
  - roc_curve.png
  - training_accuracy.png
  - training_loss.png
  - metrics.json
"""

import os
import sys
import json
import time
import numpy as np

import torch
from torch.utils.data import DataLoader, Subset
from torchvision import datasets
from sklearn.metrics import (
    classification_report, confusion_matrix,
    accuracy_score, precision_score, recall_score, f1_score,
    roc_curve, auc
)
from sklearn.preprocessing import label_binarize
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    DATASET_DIR, SAVED_MODEL_DIR, MODEL_PATH, CLASS_NAMES_PATH,
    HISTORY_PATH, EVAL_DIR, BATCH_SIZE, TRAIN_RATIO, VAL_RATIO, RANDOM_SEED,
)
from models.vit_model import load_saved_model, get_val_transforms
from train import load_and_split_dataset, set_seed


def predict_all(model, loader, device):
    """Run inference on entire loader; return (all_labels, all_preds, all_probs)."""
    model.eval()
    all_labels, all_preds, all_probs = [], [], []
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            outputs = model(images)
            probs   = torch.softmax(outputs, dim=1).cpu().numpy()
            preds   = outputs.argmax(dim=1).cpu().numpy()
            all_labels.extend(labels.numpy())
            all_preds.extend(preds)
            all_probs.extend(probs)
    return np.array(all_labels), np.array(all_preds), np.array(all_probs)


def measure_inference_time(model, device, n_runs: int = 50):
    """Measure average per-image inference time (seconds)."""
    from torchvision import transforms
    from config import IMAGE_SIZE, NORMALIZE_MEAN, NORMALIZE_STD
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(NORMALIZE_MEAN, NORMALIZE_STD),
    ])
    dummy = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE).to(device)
    model.eval()
    # Warm up
    for _ in range(5):
        with torch.no_grad():
            model(dummy)
    # Time
    times = []
    for _ in range(n_runs):
        t0 = time.perf_counter()
        with torch.no_grad():
            model(dummy)
        times.append(time.perf_counter() - t0)
    return round(float(np.mean(times)), 4), round(float(np.std(times)), 4)


def main():
    set_seed(RANDOM_SEED)
    os.makedirs(EVAL_DIR, exist_ok=True)

    # ── Load class names ──────────────────────────────────────────────────────
    with open(CLASS_NAMES_PATH) as f:
        class_names = json.load(f)
    num_classes = len(class_names)
    print(f"📂  Classes: {class_names}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️  Device: {device}")

    # ── Load model ────────────────────────────────────────────────────────────
    model = load_saved_model(MODEL_PATH, class_names, device)
    print("✅  Model loaded.")

    # ── Load test split ───────────────────────────────────────────────────────
    _, _, test_ds, _ = load_and_split_dataset(DATASET_DIR)
    test_ds.dataset.transform = get_val_transforms()
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE,
                             shuffle=False, num_workers=2)

    # ── Run predictions ───────────────────────────────────────────────────────
    print("🔍  Running inference on test set...")
    y_true, y_pred, y_prob = predict_all(model, test_loader, device)

    # ── Metrics ───────────────────────────────────────────────────────────────
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    rec  = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1   = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    avg_inf, std_inf = measure_inference_time(model, device)

    metrics = {
        "accuracy":          round(acc * 100, 2),
        "precision":         round(prec * 100, 2),
        "recall":            round(rec * 100, 2),
        "f1_score":          round(f1 * 100, 2),
        "avg_inference_s":   avg_inf,
        "std_inference_s":   std_inf,
        "num_test_samples":  int(len(y_true)),
        "classes":           class_names,
    }
    print("\n📊  Metrics:")
    for k, v in metrics.items():
        print(f"   {k}: {v}")

    metrics_path = os.path.join(EVAL_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    # ── Classification Report ──────────────────────────────────────────────────
    report = classification_report(y_true, y_pred, target_names=class_names)
    print("\n📋  Classification Report:\n", report)
    with open(os.path.join(EVAL_DIR, "classification_report.txt"), "w") as f:
        f.write(report)

    # ── Confusion Matrix ───────────────────────────────────────────────────────
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(7, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Greens",
                xticklabels=class_names, yticklabels=class_names,
                linewidths=0.5, cbar_kws={"shrink": 0.8})
    plt.title("Confusion Matrix — PlastiVision AI", fontsize=14, fontweight="bold")
    plt.ylabel("Actual", fontsize=12)
    plt.xlabel("Predicted", fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "confusion_matrix.png"), dpi=150)
    plt.close()
    print("💾  Confusion matrix saved.")

    # ── ROC Curve ─────────────────────────────────────────────────────────────
    plt.figure(figsize=(8, 6))
    if num_classes == 2:
        fpr, tpr, _ = roc_curve(y_true, y_prob[:, 1])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, color="#2E7D32", lw=2.5,
                 label=f"ROC Curve (AUC = {roc_auc:.3f})")
    else:
        y_bin = label_binarize(y_true, classes=list(range(num_classes)))
        for i, cn in enumerate(class_names):
            fpr, tpr, _ = roc_curve(y_bin[:, i], y_prob[:, i])
            roc_auc = auc(fpr, tpr)
            plt.plot(fpr, tpr, lw=2, label=f"{cn} (AUC={roc_auc:.3f})")
    plt.plot([0, 1], [0, 1], "k--", lw=1)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve — PlastiVision AI")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, "roc_curve.png"), dpi=150)
    plt.close()
    print("💾  ROC curve saved.")

    # ── Training curves ───────────────────────────────────────────────────────
    if os.path.isfile(HISTORY_PATH):
        with open(HISTORY_PATH) as f:
            history = json.load(f)
        epochs = range(1, len(history["train_acc"]) + 1)

        # Accuracy
        fig, ax = plt.subplots(figsize=(9, 5))
        ax.plot(epochs, history["train_acc"], "#2E7D32", lw=2.5, label="Train Accuracy")
        ax.plot(epochs, history["val_acc"],   "#1565C0", lw=2.5, ls="--", label="Val Accuracy")
        ax.set_xlabel("Epoch");  ax.set_ylabel("Accuracy (%)")
        ax.set_title("Training vs Validation Accuracy")
        ax.legend();  ax.grid(alpha=0.3);  plt.tight_layout()
        plt.savefig(os.path.join(EVAL_DIR, "training_accuracy.png"), dpi=150)
        plt.close()

        # Loss
        fig, ax = plt.subplots(figsize=(9, 5))
        ax.plot(epochs, history["train_loss"], "#2E7D32", lw=2.5, label="Train Loss")
        ax.plot(epochs, history["val_loss"],   "#C62828", lw=2.5, ls="--", label="Val Loss")
        ax.set_xlabel("Epoch");  ax.set_ylabel("Loss")
        ax.set_title("Training vs Validation Loss")
        ax.legend();  ax.grid(alpha=0.3);  plt.tight_layout()
        plt.savefig(os.path.join(EVAL_DIR, "training_loss.png"), dpi=150)
        plt.close()
        print("💾  Training curves saved.")

    print(f"\n🎉  Evaluation complete! Outputs saved to: {EVAL_DIR}")


if __name__ == "__main__":
    main()
