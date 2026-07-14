"""
PlastiVision AI — Data Augmentation Configuration (Training)
=============================================================
Augmentations are applied through torchvision transforms in
models/vit_model.py → get_train_transforms().

This module documents the augmentation strategy and provides
helper functions for visualisation / debugging.
"""
from torchvision import transforms
from config import IMAGE_SIZE, NORMALIZE_MEAN, NORMALIZE_STD


def get_augmentation_pipeline() -> transforms.Compose:
    """
    Returns the full training augmentation pipeline.

    Applied augmentations:
        - Resize to (IMAGE_SIZE + 32) then RandomCrop to IMAGE_SIZE
        - RandomHorizontalFlip
        - RandomRotation up to ±40°
        - ColorJitter (brightness, contrast, saturation, hue)
        - RandomAffine (translation ±10%, zoom 85–115%)
        - GaussianBlur (approximates Gaussian noise)
        - ToTensor + Normalize (ImageNet stats)
    """
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE + 32, IMAGE_SIZE + 32)),
        transforms.RandomCrop(IMAGE_SIZE),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(degrees=40),
        transforms.ColorJitter(
            brightness=0.4,
            contrast=0.4,
            saturation=0.2,
            hue=0.1,
        ),
        transforms.RandomAffine(
            degrees=0,
            translate=(0.1, 0.1),
            scale=(0.85, 1.15),
        ),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
    ])


AUGMENTATION_DESCRIPTIONS = {
    "Rotation":         "Random rotation up to ±40 degrees",
    "Brightness":       "ColorJitter brightness factor 0.4",
    "Contrast":         "ColorJitter contrast factor 0.4",
    "Zoom":             "RandomAffine scale 85–115%",
    "Translation":      "RandomAffine translate ±10%",
    "Random Crop":      "Crop to 224×224 from 256×256 resized",
    "Gaussian Noise":   "GaussianBlur kernel=3, sigma 0.1–2.0",
    "Horizontal Flip":  "Random horizontal mirror",
}
