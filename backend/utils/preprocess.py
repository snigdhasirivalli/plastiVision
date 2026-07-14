"""
PlastiVision AI — Image Preprocessing for Inference
====================================================
Takes a PIL image or file path and returns a batch tensor
ready for the ViT model.
"""
from PIL import Image
import torch
from models.vit_model import get_val_transforms


def preprocess_image(image_input) -> torch.Tensor:
    """
    Preprocess a single image for ViT inference.

    Args:
        image_input: PIL.Image, file path (str), or file-like object.

    Returns:
        Tensor of shape [1, 3, 224, 224] (batch of 1, normalised).
    """
    if isinstance(image_input, str):
        img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
    else:
        img = Image.open(image_input).convert("RGB")

    transform = get_val_transforms()
    tensor = transform(img)               # [3, 224, 224]
    return tensor.unsqueeze(0)            # [1, 3, 224, 224]
