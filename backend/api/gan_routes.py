"""
PlastiVision AI — GAN & Adversarial T&E API Routes
===================================================
Endpoints:
  GET  /api/gan/status      → Checks availability and T&E configuration
  GET  /api/gan/metrics     → Returns T&E framework benchmark metrics
  POST /api/gan/generate    → Synthesizes realistic waste image for a class (0: Bio, 1: Non-Bio)
  POST /api/gan/adversarial → Runs adversarial perturbation test on input image
"""

import os
import sys
import json
import base64
import io
from flask import Blueprint, request, jsonify
from PIL import Image
import torch
import torch.nn.functional as F
import numpy as np

gan_bp = Blueprint("gan_bp", __name__)

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT_DIR)

from gan.model import ConditionalGenerator, AdversarialPerturbationGenerator, GANClassifierPipeline
from backend.models.vit_model import load_saved_model, get_val_transforms
from backend.config import SAVED_MODEL_DIR, MODEL_PATH, CLASS_NAMES_PATH

# Global pipeline instance
_PIPELINE = None


def get_pipeline():
    global _PIPELINE
    if _PIPELINE is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        try:
            with open(CLASS_NAMES_PATH, "r") as f:
                class_names = json.load(f)
            from backend.models.vit_model import build_model
            classifier = build_model(num_classes=len(class_names), pretrained=False)
            if os.path.exists(MODEL_PATH):
                classifier.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        except Exception:
            from backend.models.vit_model import build_model
            classifier = build_model(num_classes=2, pretrained=False)

        _PIPELINE = GANClassifierPipeline(classifier=classifier, device=device)
    return _PIPELINE


@gan_bp.route("/gan/status", methods=["GET"])
def gan_status():
    return jsonify({
        "status": "ready",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "framework": "DoD CDAO Test and Evaluation of AI Models Framework",
        "models": {
            "gan_generator": "Conditional DCGAN (64x64/224x224)",
            "adv_perturbation_generator": "AdvGAN ResNet Perturbation Network",
            "classifier": "Vision Transformer (ViT) / Custom CNN"
        }
    }), 200


@gan_bp.route("/gan/metrics", methods=["GET"])
def gan_metrics():
    report_path = os.path.join(ROOT_DIR, "gan", "evaluation_results", "gan_te_evaluation_report.json")
    if os.path.exists(report_path):
        with open(report_path, "r") as f:
            data = json.load(f)
        return jsonify(data), 200
    return jsonify({
        "error": "T&E report not yet generated. Run python gan/evaluate_te.py to generate."
    }), 404


@gan_bp.route("/gan/generate", methods=["POST"])
def gan_generate():
    """Generates synthetic waste image conditioned on class: 0 (Biodegradable) or 1 (Non-Biodegradable)."""
    body = request.get_json(silent=True) or {}
    class_label = int(body.get("class_label", 0))
    pipeline = get_pipeline()

    syn_tensor = pipeline.generate_synthetic(num_samples=1, class_label=class_label)
    img_np = syn_tensor[0].cpu().permute(1, 2, 0).numpy()
    img_np = (np.clip(img_np, 0, 1) * 255).astype(np.uint8)
    pil_img = Image.fromarray(img_np)

    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    img_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return jsonify({
        "class_label": class_label,
        "class_name": "Biodegradable" if class_label == 0 else "Non_Biodegradable",
        "image_base64": f"data:image/png;base64,{img_b64}"
    }), 200


@gan_bp.route("/gan/adversarial-test", methods=["POST"])
def gan_adversarial_test():
    """Takes an uploaded image or generated sample and tests classification under GAN perturbation."""
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]
    epsilon = float(request.form.get("epsilon", 0.08))

    img = Image.open(file.stream).convert("RGB")
    transform = get_val_transforms()
    img_tensor = transform(img).unsqueeze(0)

    pipeline = get_pipeline()
    clean_preds, clean_probs, adv_preds, adv_probs, x_adv, delta = pipeline.attack_and_classify(img_tensor, eps=epsilon)

    classes = ["Biodegradable", "Non_Biodegradable"]

    return jsonify({
        "epsilon": epsilon,
        "clean": {
            "prediction": classes[clean_preds[0].item()],
            "confidence": round(clean_probs[0, clean_preds[0].item()].item() * 100, 2),
            "probabilities": {classes[i]: round(clean_probs[0, i].item() * 100, 2) for i in range(len(classes))}
        },
        "perturbed": {
            "prediction": classes[adv_preds[0].item()],
            "confidence": round(adv_probs[0, adv_preds[0].item()].item() * 100, 2),
            "probabilities": {classes[i]: round(adv_probs[0, i].item() * 100, 2) for i in range(len(classes))}
        },
        "adversarial_flip": bool(clean_preds[0].item() != adv_preds[0].item())
    }), 200
