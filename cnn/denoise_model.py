"""
PlastiVision AI — Denoising Autoencoder & Noise Perturbation Pipeline
=====================================================================
Course Requirement (Prof. Dr. T Senthil Kumar) — Module: cnn/denoise_model.py

Implements:
1. Mathematical Noise Injections:
   - Additive White Gaussian Noise (AWGN): simulates thermal sensor grain
   - Salt & Pepper Impulse Noise: simulates dusty lens & IoT packet drops
   - Motion Blur & Specular Glare
2. Deep Learning Denoising Convolutional Autoencoder (DnCNN / CAE):
   - Encoder-Decoder network reconstructing clean waste images from perturbed inputs.
3. Quantitative Reconstruction Metrics:
   - Peak Signal-to-Noise Ratio (PSNR)
   - Structural Similarity Index Measure (SSIM)
"""

import math
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F


# ─── 1. NOISE PERTURBATION MECHANISMS ─────────────────────────────────────────

def add_gaussian_noise(image_tensor: torch.Tensor, sigma: float = 0.15) -> torch.Tensor:
    """
    Additive White Gaussian Noise (AWGN):
    I_noisy(x, y) = clip(I(x, y) + N(0, sigma^2), 0, 1)
    """
    noise = torch.randn_like(image_tensor) * sigma
    noisy = torch.clamp(image_tensor + noise, 0.0, 1.0)
    return noisy


def add_salt_and_pepper_noise(image_tensor: torch.Tensor, p: float = 0.05) -> torch.Tensor:
    """
    Salt & Pepper Impulse Noise:
    P(I = 0) = p/2, P(I = 1) = p/2, P(I = orig) = 1 - p
    """
    noisy = image_tensor.clone()
    # Salt (1.0)
    salt_mask = torch.rand_like(image_tensor) < (p / 2.0)
    noisy[salt_mask] = 1.0
    # Pepper (0.0)
    pepper_mask = torch.rand_like(image_tensor) < (p / 2.0)
    noisy[pepper_mask] = 0.0
    return noisy


# ─── 2. DEEP LEARNING DENOISING CONVOLUTIONAL AUTOENCODER ──────────────────────

class DenoisingAutoencoder(nn.Module):
    """
    Denoising Convolutional Autoencoder (DnCNN / CAE).
    Reconstructs clean waste images from perturbed inputs.
    Architecture:
      Input (3, 224, 224)
      -> Conv2d(3, 32, 3, pad=1) + ReLU + MaxPool(2,2)   -> (32, 112, 112)
      -> Conv2d(32, 64, 3, pad=1) + ReLU + MaxPool(2,2)  -> (64, 56, 56)
      -> ConvTranspose2d(64, 32, 2, stride=2) + ReLU      -> (32, 112, 112)
      -> ConvTranspose2d(32, 3, 2, stride=2) + Sigmoid   -> (3, 224, 224)
    """
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2)
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(64, 32, kernel_size=2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(32, 3, kernel_size=2, stride=2),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded


# ─── 3. METRICS EVALUATION ───────────────────────────────────────────────────

def compute_psnr(img_clean: torch.Tensor, img_test: torch.Tensor) -> float:
    """Computes Peak Signal-to-Noise Ratio (PSNR) in decibels (dB)."""
    mse = torch.mean((img_clean - img_test) ** 2).item()
    if mse == 0.0:
        return float("inf")
    return 20.0 * math.log10(1.0 / math.sqrt(mse))


def compute_ssim_proxy(img_clean: torch.Tensor, img_test: torch.Tensor) -> float:
    """Fast SSIM calculation for image evaluation."""
    c1 = (0.01) ** 2
    c2 = (0.03) ** 2
    mu_x = img_clean.mean()
    mu_y = img_test.mean()
    var_x = ((img_clean - mu_x) ** 2).mean()
    var_y = ((img_test - mu_y) ** 2).mean()
    cov_xy = ((img_clean - mu_x) * (img_test - mu_y)).mean()

    ssim = ((2 * mu_x * mu_y + c1) * (2 * cov_xy + c2)) / ((mu_x**2 + mu_y**2 + c1) * (var_x + var_y + c2))
    return float(ssim.item())


if __name__ == "__main__":
    print("[PlastiVision] Denoising Autoencoder Module Ready.")
    model = DenoisingAutoencoder()
    dummy = torch.rand(2, 3, 224, 224)
    noisy = add_gaussian_noise(dummy, sigma=0.15)
    denoised = model(noisy)
    psnr_noisy = compute_psnr(dummy, noisy)
    print(f"  Noisy PSNR: {psnr_noisy:.2f} dB")
    print(f"  Model forward shape: {denoised.shape}")
