"""
PlastiVision AI — ViT Training Script
======================================
Usage:
    cd backend
    python train.py

The script:
  1. Loads the dataset from config.DATASET_DIR
  2. Applies augmentation and splits 70/15/15
  3. Fine-tunes vit_small_patch16_224 (pretrained on ImageNet)
  4. Implements Early Stopping + Model Checkpoint + LR Scheduler
  5. Saves:
       saved_model/best_model.pth
       saved_model/class_names.json
       saved_model/training_history.json

To replace the dataset later:
    1. Point DATASET_DIR in config.py to your new dataset folder
    2. Update CLASS_NAMES and WASTE_MAPPING in config.py
    3. Re-run: python train.py
"""

import os
import sys
import json
import time
import random
import numpy as np

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
from torchvision import datasets

# ── Make sure backend/ is in path when running from project root ─────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    DATASET_DIR, SAVED_MODEL_DIR, MODEL_PATH, CLASS_NAMES_PATH, HISTORY_PATH,
    BATCH_SIZE, NUM_EPOCHS, LEARNING_RATE, WEIGHT_DECAY,
    EARLY_STOP_PATIENCE, TRAIN_RATIO, VAL_RATIO, RANDOM_SEED,
)
from models.vit_model import build_model, get_train_transforms, get_val_transforms


# ── Reproducibility ───────────────────────────────────────────────────────────
def set_seed(seed: int = RANDOM_SEED):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


# ── Dataset Loader ────────────────────────────────────────────────────────────
def load_and_split_dataset(dataset_dir: str):
    """
    Load dataset with ImageFolder (expects subfolders per class).
    Split into train/val/test subsets with stratification.

    Returns: (train_ds, val_ds, test_ds, class_names)
    """
    if not os.path.isdir(dataset_dir):
        raise FileNotFoundError(
            f"\n\nDataset not found at: {dataset_dir}\n"
            "Please download the Waste Classification dataset from Kaggle:\n"
            "  https://www.kaggle.com/datasets/techsash/waste-classification-data\n"
            "Extract and place the TRAIN folder contents into: dataset/raw/\n"
            "Expected structure:\n"
            "  dataset/raw/O/   - Organic images\n"
            "  dataset/raw/R/   - Recyclable images\n"
        )

    # Load full dataset with augmentation transform (swapped for val below)
    full_dataset = datasets.ImageFolder(root=dataset_dir,
                                        transform=get_train_transforms())
    class_names = full_dataset.classes
    n = len(full_dataset)
    print(f"[OK] Dataset loaded: {n} images | Classes: {class_names}")

    # Stratified split: collect indices per class
    class_indices = {c: [] for c in range(len(class_names))}
    for idx, (_, label) in enumerate(full_dataset.samples):
        class_indices[label].append(idx)

    train_idx, val_idx, test_idx = [], [], []
    for label, indices in class_indices.items():
        random.shuffle(indices)
        n_train = int(len(indices) * TRAIN_RATIO)
        n_val   = int(len(indices) * VAL_RATIO)
        train_idx.extend(indices[:n_train])
        val_idx.extend(indices[n_train:n_train + n_val])
        test_idx.extend(indices[n_train + n_val:])

    print(f"   Train: {len(train_idx)} | Val: {len(val_idx)} | Test: {len(test_idx)}")

    # Val and Test use deterministic transforms (no augmentation)
    val_dataset = datasets.ImageFolder(root=dataset_dir,
                                       transform=get_val_transforms())
    test_dataset = datasets.ImageFolder(root=dataset_dir,
                                        transform=get_val_transforms())

    train_ds = Subset(full_dataset, train_idx)
    val_ds   = Subset(val_dataset,  val_idx)
    test_ds  = Subset(test_dataset, test_idx)

    return train_ds, val_ds, test_ds, class_names


# ── Early Stopping ────────────────────────────────────────────────────────────
class EarlyStopping:
    def __init__(self, patience: int = EARLY_STOP_PATIENCE, min_delta: float = 1e-4):
        self.patience   = patience
        self.min_delta  = min_delta
        self.best_val   = float('inf')
        self.counter    = 0
        self.triggered  = False

    def step(self, val_loss: float) -> bool:
        """Returns True if training should stop."""
        if val_loss < self.best_val - self.min_delta:
            self.best_val = val_loss
            self.counter  = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.triggered = True
        return self.triggered


# ── Training Loop ─────────────────────────────────────────────────────────────
def train_one_epoch(model, loader, criterion, optimizer, device, scaler, use_amp):
    model.train()
    total_loss, correct, total = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        with torch.amp.autocast(device_type=device.type, enabled=use_amp):
            outputs = model(images)
            loss    = criterion(outputs, labels)
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        total_loss += loss.item() * images.size(0)
        preds       = outputs.argmax(dim=1)
        correct    += (preds == labels).sum().item()
        total      += images.size(0)
    return total_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss    = criterion(outputs, labels)
        total_loss += loss.item() * images.size(0)
        preds       = outputs.argmax(dim=1)
        correct    += (preds == labels).sum().item()
        total      += images.size(0)
    return total_loss / total, correct / total


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    set_seed()
    os.makedirs(SAVED_MODEL_DIR, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Device] {device}")

    # ── Load dataset ──────────────────────────────────────────────────────────
    train_ds, val_ds, test_ds, class_names = load_and_split_dataset(DATASET_DIR)

    use_pin = device.type == 'cuda'
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE,
                              shuffle=True,  num_workers=0, pin_memory=use_pin)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE,
                              shuffle=False, num_workers=0, pin_memory=use_pin)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE,
                              shuffle=False, num_workers=0, pin_memory=use_pin)

    # ── Model ─────────────────────────────────────────────────────────────────
    num_classes = len(class_names)
    model = build_model(num_classes=num_classes, pretrained=True)
    model = model.to(device)
    print(f"[Model] vit_small_patch16_224 | Classes: {class_names}")

    # ── Optimizer + Scheduler + Loss ──────────────────────────────────────────
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE,
                           weight_decay=WEIGHT_DECAY)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=NUM_EPOCHS, eta_min=1e-6
    )
    use_amp = device.type == 'cuda'
    # GradScaler only meaningful for GPU; on CPU use a no-op version
    if use_amp:
        scaler = torch.amp.GradScaler('cuda')
    else:
        scaler = torch.amp.GradScaler('cpu', enabled=False)
    early_stop = EarlyStopping(patience=EARLY_STOP_PATIENCE)

    # ── Training ──────────────────────────────────────────────────────────────
    history = {
        "train_loss": [], "val_loss": [],
        "train_acc":  [], "val_acc":  [],
        "lr": [],
    }
    best_val_acc = 0.0
    print(f"\nStarting training for up to {NUM_EPOCHS} epochs...\n")

    for epoch in range(1, NUM_EPOCHS + 1):
        t0 = time.time()

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device, scaler, use_amp
        )
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        elapsed = time.time() - t0
        lr_now  = scheduler.get_last_lr()[0]

        history["train_loss"].append(round(train_loss, 4))
        history["val_loss"].append(round(val_loss, 4))
        history["train_acc"].append(round(train_acc * 100, 2))
        history["val_acc"].append(round(val_acc * 100, 2))
        history["lr"].append(round(lr_now, 8))

        print(
            f"Epoch [{epoch:02d}/{NUM_EPOCHS}] "
            f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}% | "
            f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.2f}% | "
            f"LR: {lr_now:.2e} | {elapsed:.1f}s"
        )

        # ── Model Checkpoint ─────────────────────────────────────────────────
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"   [SAVED] Best model (Val Acc: {val_acc*100:.2f}%)")

        # ── Early Stopping ────────────────────────────────────────────────────
        if early_stop.step(val_loss):
            print(f"\n[EARLY STOP] Triggered at epoch {epoch}.")
            break

    # ── Final Test Evaluation ─────────────────────────────────────────────────
    print("\n[TEST] Evaluating on test set...")
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    test_loss, test_acc = evaluate(model, test_loader, criterion, device)
    print(f"[TEST] Loss: {test_loss:.4f} | Accuracy: {test_acc*100:.2f}%")

    history["test_acc"]  = round(test_acc * 100, 2)
    history["test_loss"] = round(test_loss, 4)

    # ── Save Metadata ─────────────────────────────────────────────────────────
    with open(CLASS_NAMES_PATH, "w") as f:
        json.dump(class_names, f)
    print(f"[SAVED] Class names -> {CLASS_NAMES_PATH}")

    with open(HISTORY_PATH, "w") as f:
        json.dump(history, f, indent=2)
    print(f"[SAVED] Training history -> {HISTORY_PATH}")

    print(f"\n[DONE] Training complete! Best Val Acc: {best_val_acc*100:.2f}%")
    print(f"   Model saved at: {MODEL_PATH}")
    print(f"\nNext steps:")
    print(f"  1. Run: python evaluate.py")
    print(f"  2. Run: python app.py")


if __name__ == "__main__":
    main()
