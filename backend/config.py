"""
PlastiVision AI — Central Configuration
========================================
This is the single source of truth for all paths and hyperparameters.

To swap the dataset later:
  1. Replace DATASET_DIR with your new dataset path
  2. Update CLASS_NAMES to match your new class folder names
  3. Update WASTE_MAPPING for the new class→category mapping
  4. Run: python backend/train.py
  5. Run: python backend/app.py
  No other files need to change.
"""
import os

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT    = os.path.dirname(BASE_DIR)

DATASET_DIR     = os.path.join(PROJECT_ROOT, "dataset", "raw")
SAVED_MODEL_DIR = os.path.join(BASE_DIR, "saved_model")
EVAL_DIR        = os.path.join(BASE_DIR, "saved_model", "evaluation")

KERAS_MODEL_PATH = os.path.join(SAVED_MODEL_DIR, "best_model.keras")
PTH_MODEL_PATH   = os.path.join(SAVED_MODEL_DIR, "best_model.pth")
MODEL_PATH       = PTH_MODEL_PATH if os.path.isfile(PTH_MODEL_PATH) else KERAS_MODEL_PATH
CLASS_NAMES_PATH = os.path.join(SAVED_MODEL_DIR, "class_names.json")
HISTORY_PATH     = os.path.join(SAVED_MODEL_DIR, "training_history.json")

# ── Dataset ─────────────────────────────────────────────────────────────────────
# Folder names inside DATASET_DIR (case-sensitive on Linux)
CLASS_NAMES = ["Biodegradable", "Non_Biodegradable"]

# Mapping: class folder name → display info
# When you replace the dataset, update this dict accordingly.
WASTE_MAPPING = {
    "Biodegradable": {
        "detected_object": "Organic Waste",
        "waste_category":  "Biodegradable",
        "recommended_bin": "Compost Bin",
    },
    "Non_Biodegradable": {
        "detected_object": "Recyclable Waste",
        "waste_category":  "Non_Biodegradable",
        "recommended_bin": "Recycle Bin",
    },
}

# ── Model ───────────────────────────────────────────────────────────────────────
MODEL_NAME   = "vit_small_patch16_224"   # timm ViT model (transformer, not CNN)
IMAGE_SIZE   = 224
NUM_CHANNELS = 3

# ── Training Hyperparameters ────────────────────────────────────────────────────
BATCH_SIZE       = 32
NUM_EPOCHS       = 30
LEARNING_RATE    = 3e-4
WEIGHT_DECAY     = 1e-4
EARLY_STOP_PATIENCE = 5

# Dataset split ratios
TRAIN_RATIO = 0.70
VAL_RATIO   = 0.15
TEST_RATIO  = 0.15

# ── Normalization (ImageNet stats for pretrained ViT) ───────────────────────────
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD  = [0.229, 0.224, 0.225]

# ── Flask ───────────────────────────────────────────────────────────────────────
FLASK_HOST = "0.0.0.0"
FLASK_PORT = 5000
FLASK_DEBUG = False

# ── Misc ────────────────────────────────────────────────────────────────────────
RANDOM_SEED = 42
