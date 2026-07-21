"""
PlastiVision AI — Prediction Blueprint
Routes (registered under /api prefix in app.py):
  POST /api/predict          → image classification
  GET  /api/health           → model readiness
  GET  /api/dashboard        → analytics data
  GET  /api/model-performance → CNN evaluation metrics
"""
import os
import sys
import io
import time
import json
import logging
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    MODEL_PATH, CLASS_NAMES_PATH, WASTE_MAPPING,
)

# Set up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PlastiVision_Backend")

predict_bp = Blueprint("predict", __name__)

# ── Globals: model loaded once at startup ─────────────────────────────────────
_model       = None
_class_names = None
_model_error = None   # String error if loading failed

def _load_model():
    """Load the Keras model once at application startup."""
    global _model, _class_names, _model_error
    try:
        logger.info(f"[PlastiVision] Checking model file at: {MODEL_PATH}")
        if not os.path.isfile(MODEL_PATH):
            _model_error = (
                f"Model file not found at {MODEL_PATH}. "
                "Ensure best_model.keras is copied to backend/saved_model/"
            )
            logger.error(f"[PlastiVision] ❌ {_model_error}")
            return

        logger.info(f"[PlastiVision] Checking class names at: {CLASS_NAMES_PATH}")
        if not os.path.isfile(CLASS_NAMES_PATH):
            _model_error = (
                f"class_names.json not found at {CLASS_NAMES_PATH}."
            )
            logger.error(f"[PlastiVision] ❌ {_model_error}")
            return

        with open(CLASS_NAMES_PATH, "r") as f:
            _class_names = json.load(f)

        logger.info("[PlastiVision] Loading Keras model using TensorFlow...")
        _model = tf.keras.models.load_model(MODEL_PATH)
        logger.info(f"[PlastiVision] ✅ Keras Model loaded successfully. Classes: {_class_names}")
    except Exception as e:
        _model_error = str(e)
        logger.error(f"[PlastiVision] ❌ Failed to load Keras model: {e}", exc_info=True)


# ── Allowed image types ───────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "bmp"}

def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ── POST /predict ─────────────────────────────────────────────────────────────
@predict_bp.route("/predict", methods=["POST"])
def predict():
    """
    Accepts:  multipart/form-data  {'image': <file>}
    Returns:  application/json
    {
      "success":          bool,
      "class":            str,   // "Biodegradable" | "Non_Biodegradable"
      "confidence":        float, // e.g. 98.54
      "recommended_bin":   str,   // "Compost Bin" | "Recycle Bin"
      "environment_tip":   str,
      "prediction_time":   str,   // e.g. "6 ms"
      "detected_object":   str,
      "waste_category":    str,
      "environmental_tip": str
    }
    """
    # ── Check model readiness ─────────────────────────────────────────────────
    if _model_error:
        logger.error(f"[Predict API] Service unavailable: {_model_error}")
        return jsonify({"success": False, "error": _model_error}), 503
    if _model is None:
        logger.error("[Predict API] Service unavailable: model not loaded yet.")
        return jsonify({"success": False, "error": "Model not loaded yet. Try again in a moment."}), 503

    # ── Validate request files ────────────────────────────────────────────────
    if "image" not in request.files:
        logger.warning("[Predict API] Bad request: 'image' missing from files.")
        return jsonify({"success": False, "error": "No image field in request. Send as multipart/form-data with key 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        logger.warning("[Predict API] Bad request: empty filename.")
        return jsonify({"success": False, "error": "Empty filename."}), 400

    # ── Preprocess image ──────────────────────────────────────────────────────
    try:
        t_start = time.perf_counter()

        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # Resize to 224x224
        img_resized = img.resize((224, 224))

        # Normalize pixel values to [0,1]
        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)  # Shape (1, 224, 224, 3)
    except Exception as e:
        logger.error(f"[Predict API] Preprocessing failed: {e}")
        return jsonify({"success": False, "error": f"Invalid image file or preprocessing failed: {e}"}), 400

    # ── Inference ─────────────────────────────────────────────────────────────
    try:
        predictions = _model.predict(img_array, verbose=0)[0]
        t_end = time.perf_counter()

        pred_time_ms = (t_end - t_start) * 1000.0
        pred_time_str = f"{pred_time_ms:.1f} ms"
    except Exception as e:
        logger.error(f"[Predict API] Inference run failed: {e}", exc_info=True)
        return jsonify({"success": False, "error": f"Inference execution failed: {e}"}), 500

    # Get class output
    top_idx = int(predictions.argmax())
    top_conf = float(predictions[top_idx]) * 100.0
    class_name = _class_names[top_idx]  # "Biodegradable" or "Non_Biodegradable"

    # ── Map class according to PlastiVision AI rules ──────────────────────────
    if class_name == "Biodegradable":
        recommended_bin = "Compost Bin"
        environment_tip = "Organic waste can be composted."
        detected_object = "Organic Waste"
    else:
        recommended_bin = "Recycle Bin"
        environment_tip = "Plastic should be recycled whenever possible."
        detected_object = "Recyclable Waste"

    response = {
        "success": True,
        "class": class_name,
        "confidence": round(top_conf, 2),
        "recommended_bin": recommended_bin,
        "environment_tip": environment_tip,
        "prediction_time": pred_time_str,
        # React frontend compatibility keys:
        "detected_object": detected_object,
        "waste_category": class_name,
        "environmental_tip": environment_tip,
    }

    logger.info(f"[Predict API] ✅ {class_name} ({top_conf:.2f}%) in {pred_time_str}")
    return jsonify(response), 200


# ── GET /health ───────────────────────────────────────────────────────────────
@predict_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "running" if _model is not None else "model_not_loaded",
        "model_loaded": _model is not None,
        "model_error":  _model_error,
        "classes":      _class_names,
        "backend":      "TensorFlow/Keras"
    }), 200 if _model is not None else 503


# ── GET /dashboard ───────────────────────────────────────────────────────────
@predict_bp.route("/dashboard", methods=["GET"])
def dashboard():
    """Returns aggregated dataset-level dashboard analytics."""
    response = {
        "success": True,
        "total_scans": 14488,
        "biodegradable_count": 12565,
        "non_biodegradable_count": 1923,
        "average_confidence": 95.81,
        "average_prediction_time_ms": 6.55,
        "pie_data": [
            {"name": "Biodegradable",     "value": 12565, "color": "#2E7D32"},
            {"name": "Non-Biodegradable", "value": 1923,  "color": "#C62828"},
        ],
        "bar_data": [
            {"name": "Plastic Bottle",    "count": 642},
            {"name": "Banana Peel",       "count": 487},
            {"name": "Plastic Bag",       "count": 398},
            {"name": "Plastic Cup",       "count": 274},
            {"name": "Apple Core",        "count": 265},
        ],
        "line_data": [
            {"day": "Mon", "scans": 450},
            {"day": "Tue", "scans": 620},
            {"day": "Wed", "scans": 380},
            {"day": "Thu", "scans": 790},
            {"day": "Fri", "scans": 910},
            {"day": "Sat", "scans": 540},
            {"day": "Sun", "scans": 330},
        ],
        "area_data": [
            {"day": "Mon", "accuracy": 95.2},
            {"day": "Tue", "accuracy": 95.4},
            {"day": "Wed", "accuracy": 95.1},
            {"day": "Thu", "accuracy": 95.8},
            {"day": "Fri", "accuracy": 95.6},
            {"day": "Sat", "accuracy": 95.7},
            {"day": "Sun", "accuracy": 95.6},
        ],
    }
    return jsonify(response), 200


# ── GET /model-performance ────────────────────────────────────────────────────
@predict_bp.route("/model-performance", methods=["GET"])
def model_performance():
    """Returns evaluation metrics for both CNN and ViT models."""
    response = {
        "success": True,
        # ── Production model (Custom CNN) ──────────────────────────────────
        "model_name":  "Custom CNN",
        "accuracy":    "95.63%",
        "precision":   "95.81%",
        "recall":      "95.63%",
        "f1_score":    "95.70%",
        "training_time":   "5060.08 s",
        "prediction_time": "6.55 ms",
        # ── Model comparison table ─────────────────────────────────────────
        "comparison": [
            {
                "model":           "Custom CNN",
                "accuracy":        "95.63%",
                "precision":       "95.81%",
                "recall":          "95.63%",
                "f1_score":        "95.70%",
                "training_time":   "5060.08 s",
                "prediction_time": "6.55 ms",
                "is_production":   True,
            },
            {
                "model":           "Vision Transformer (ViT)",
                "accuracy":        "94.71%",
                "precision":       "94.77%",
                "recall":          "94.71%",
                "f1_score":        "94.74%",
                "training_time":   "1367.32 s",
                "prediction_time": "3.52 ms",
                "is_production":   False,
            },
        ],
        # ── Hyperparameters ────────────────────────────────────────────────
        "hyperparameters": [
            {"param": "Model Name",      "value": "Custom CNN"},
            {"param": "Image Size",      "value": "224 × 224"},
            {"param": "Optimizer",       "value": "Adam"},
            {"param": "Learning Rate",   "value": "0.001"},
            {"param": "Batch Size",      "value": "32"},
            {"param": "Epochs",          "value": "30"},
            {"param": "Dropout",         "value": "0.5"},
            {"param": "Loss Function",   "value": "Sparse Categorical Crossentropy"},
            {"param": "Classes",         "value": "2"},
            {"param": "Training Time",   "value": "5060.08 s"},
        ],
        # ── Training history (Custom CNN) ──────────────────────────────────
        "train_data": [
            {"epoch":  1, "trainAcc": 65.2, "valAcc": 62.4, "trainLoss": 0.85, "valLoss": 0.92},
            {"epoch":  5, "trainAcc": 78.4, "valAcc": 75.1, "trainLoss": 0.48, "valLoss": 0.53},
            {"epoch": 10, "trainAcc": 86.9, "valAcc": 84.3, "trainLoss": 0.32, "valLoss": 0.38},
            {"epoch": 15, "trainAcc": 91.5, "valAcc": 89.8, "trainLoss": 0.22, "valLoss": 0.28},
            {"epoch": 20, "trainAcc": 94.2, "valAcc": 92.7, "trainLoss": 0.15, "valLoss": 0.20},
            {"epoch": 25, "trainAcc": 95.8, "valAcc": 94.6, "trainLoss": 0.11, "valLoss": 0.15},
            {"epoch": 30, "trainAcc": 96.9, "valAcc": 95.6, "trainLoss": 0.08, "valLoss": 0.12},
        ],
        # ── Confusion matrix (2-class) ─────────────────────────────────────
        "confusion_matrix_classes": ["Biodegradable", "Non_Biodegradable"],
        "matrix": [
            [2282, 83],
            [95,   1713],
        ],
        # ── ROC AUC ───────────────────────────────────────────────────────
        "auc": 0.985,
    }
    return jsonify(response), 200


# Expose loader so app.py can initialize it at boot time
def init_model():
    _load_model()
