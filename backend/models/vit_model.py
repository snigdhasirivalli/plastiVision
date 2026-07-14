"""
PlastiVision AI — Vision Transformer Model
==========================================
Uses timm's vit_small_patch16_224 (pretrained on ImageNet).
The classification head is replaced to match the number of waste classes.

To switch to a different ViT variant, change MODEL_NAME in config.py.
"""
import torch
import torch.nn as nn
import timm
from torchvision import transforms

from config import (
    MODEL_NAME, IMAGE_SIZE, NUM_CHANNELS,
    NORMALIZE_MEAN, NORMALIZE_STD,
)


def build_model(num_classes: int, pretrained: bool = True) -> nn.Module:
    """
    Load a pretrained ViT from timm and replace the classification head.

    Args:
        num_classes: Number of output classes (matches dataset).
        pretrained:  Whether to load ImageNet pretrained weights.

    Returns:
        PyTorch model ready for fine-tuning.
    """
    model = timm.create_model(
        MODEL_NAME,
        pretrained=pretrained,
        num_classes=num_classes,
    )
    return model


def get_train_transforms() -> transforms.Compose:
    """
    Returns augmentation pipeline used during training.
    Augmentations: Rotation, Brightness/Contrast, Zoom, Translation,
                   RandomCrop, GaussianBlur, HorizontalFlip, Normalize.
    """
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE + 32, IMAGE_SIZE + 32)),
        transforms.RandomCrop(IMAGE_SIZE),                       # Random Crop
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(degrees=40),                   # Rotation
        transforms.ColorJitter(brightness=0.4, contrast=0.4,    # Brightness + Contrast
                                saturation=0.2, hue=0.1),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1), # Translation
                                scale=(0.85, 1.15)),              # Zoom
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),# Gaussian Noise approx
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
    ])


def get_val_transforms() -> transforms.Compose:
    """
    Returns deterministic transforms for validation / inference.
    No augmentation — only resize, center-crop, normalize.
    """
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
    ])


def load_saved_model(model_path: str, class_names: list, device: torch.device) -> nn.Module:
    """
    Load a saved PlastiVision model checkpoint.

    Args:
        model_path:  Path to best_model.pth
        class_names: List of class names (length = num_classes)
        device:      torch device

    Returns:
        Model in eval mode on the specified device.
    """
    num_classes = len(class_names)
    model = build_model(num_classes=num_classes, pretrained=False)
    state = torch.load(model_path, map_location=device)
    model.load_state_dict(state)
    model.to(device)
    model.eval()
    return model
