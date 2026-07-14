"""
PlastiVision AI — Prediction Blueprint
POST /predict
"""
import os
import sys
import io
import time
import json
import torch
import torch.nn.functional as F
from flask import Blueprint, request, jsonify
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import (
    MODEL_PATH, CLASS_NAMES_PATH, WASTE_MAPPING,
)
from models.vit_model import load_saved_model, get_val_transforms
from utils.preprocess import preprocess_image
from utils.tips import get_tip

predict_bp = Blueprint("predict", __name__)

# ── Globals: model loaded once at startup ─────────────────────────────────────
_model       = None
_class_names = None
_device      = None
_transform   = None
_model_error = None   # String error if loading failed


def _load_model():
    """Load model into module-level variables (called once in app.py)."""
    global _model, _class_names, _device, _transform, _model_error
    try:
        if not os.path.isfile(MODEL_PATH):
            _model_error = (
                f"Model not found at {MODEL_PATH}. "
                "Run: cd backend && python train.py"
            )
            return
        if not os.path.isfile(CLASS_NAMES_PATH):
            _model_error = (
                f"class_names.json not found at {CLASS_NAMES_PATH}. "
                "Run: cd backend && python train.py"
            )
            return

        with open(CLASS_NAMES_PATH) as f:
            _class_names = json.load(f)

        _device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _model     = load_saved_model(MODEL_PATH, _class_names, _device)
        _transform = get_val_transforms()

        print(f"[PlastiVision] ✅ Model loaded | Classes: {_class_names} | Device: {_device}")
    except Exception as e:
        _model_error = str(e)
        print(f"[PlastiVision] ❌ Model load error: {e}")


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
      "detected_object":   str,
      "waste_category":    str,
      "confidence":        str,   // e.g. "97.32"
      "recommended_bin":   str,
      "environmental_tip": str,
      "prediction_time":   str,   // seconds, e.g. "0.21"
    }
    """
    # ── Check model is ready ──────────────────────────────────────────────────
    if _model_error:
        return jsonify({"error": _model_error}), 503
    if _model is None:
        return jsonify({"error": "Model not loaded yet. Try again in a moment."}), 503

    # ── Validate request ──────────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image field in request. "
                                 "Send as multipart/form-data with key 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    # Accept any image even without extension (e.g. webcam blobs)
    # ── Preprocess ────────────────────────────────────────────────────────────
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Could not open image: {e}"}), 400

    try:
        tensor = preprocess_image(img).to(_device)   # [1, 3, 224, 224]
    except Exception as e:
        return jsonify({"error": f"Preprocessing failed: {e}"}), 500

    # ── Inference ─────────────────────────────────────────────────────────────
    t_start = time.perf_counter()
    with torch.no_grad():
        logits = _model(tensor)                      # [1, num_classes]
        probs  = F.softmax(logits, dim=1)[0]         # [num_classes]
    t_end = time.perf_counter()
    pred_time = round(t_end - t_start, 3)

    top_idx   = int(probs.argmax())
    top_conf  = float(probs[top_idx]) * 100
    class_key = _class_names[top_idx]               # e.g. "O" or "R"

    # ── Map class → waste info ────────────────────────────────────────────────
    mapping = WASTE_MAPPING.get(
        class_key,
        WASTE_MAPPING.get(class_key.upper(), {
            "detected_object": class_key,
            "waste_category":  "Unknown",
            "recommended_bin": "General Bin",
        }),
    )

    tip = get_tip(class_key)

    response = {
        "detected_object":   mapping["detected_object"],
        "waste_category":    mapping["waste_category"],
        "confidence":        f"{top_conf:.2f}",
        "recommended_bin":   mapping["recommended_bin"],
        "environmental_tip": tip,
        "prediction_time":   f"{pred_time:.3f}",
        # Extra debug info (ignored by frontend ResultCard)
        "raw_class":         class_key,
        "all_confidences":   {
            _class_names[i]: f"{float(probs[i])*100:.2f}"
            for i in range(len(_class_names))
        },
    }
    return jsonify(response), 200


# ── GET /health ───────────────────────────────────────────────────────────────
@predict_bp.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok" if _model is not None else "model_not_loaded",
        "model_loaded": _model is not None,
        "model_error":  _model_error,
        "classes":      _class_names,
        "device":       str(_device),
    }), 200 if _model is not None else 503


# Expose loader so app.py can call it
def init_model():
    _load_model()
