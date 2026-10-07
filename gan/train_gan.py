"""
PlastiVision AI — Conditional GAN & Adversarial Perturbation Training
======================================================================
Trains:
1. Conditional DCGAN to synthesize realistic Biodegradable & Non-Biodegradable images.
2. Saves trained checkpoints into `gan/saved_gan/`.
"""

import os
import sys
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
import numpy as np

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))

from gan.model import ConditionalGenerator, ConditionalDiscriminator
from backend.config import DATASET_DIR


def get_gan_transforms():
    """Transforms for training GAN at 64x64 resolution, normalized to [-1, 1]."""
    return transforms.Compose([
        transforms.Resize((64, 64)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])


def train_cgan(epochs=5, batch_size=32, lr=0.0002, latent_dim=100, num_samples=500, save_dir="gan/saved_gan"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    os.makedirs(save_dir, exist_ok=True)

    print(f"[GAN Trainer] Using device: {device}")
    candidates = [
        os.path.join(ROOT_DIR, "Final_Dataset", "train"),
        os.path.join(ROOT_DIR, "Final_Dataset"),
        os.path.join(DATASET_DIR, "train"),
        DATASET_DIR
    ]
    train_dir = None
    for cand in candidates:
        if os.path.exists(cand):
            subdirs = [d for d in os.listdir(cand) if os.path.isdir(os.path.join(cand, d))]
            if len(subdirs) >= 2:
                train_dir = cand
                break
    if not train_dir:
        raise FileNotFoundError(f"Could not find valid train dataset directory in {candidates}")
    print(f"[GAN Trainer] Using dataset from: {train_dir}")
    dataset = datasets.ImageFolder(root=train_dir, transform=get_gan_transforms())

    if num_samples and num_samples < len(dataset):
        indices = np.random.choice(len(dataset), num_samples, replace=False)
        dataset = Subset(dataset, indices)

    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, drop_last=True)
    num_classes = 2

    generator = ConditionalGenerator(latent_dim=latent_dim, num_classes=num_classes).to(device)
    discriminator = ConditionalDiscriminator(num_classes=num_classes).to(device)

    criterion = nn.BCELoss()
    opt_g = optim.Adam(generator.parameters(), lr=lr, betas=(0.5, 0.999))
    opt_d = optim.Adam(discriminator.parameters(), lr=lr, betas=(0.5, 0.999))

    print(f"[GAN Trainer] Starting training for {epochs} epochs on {len(dataset)} samples...")

    for epoch in range(epochs):
        g_loss_epoch = 0.0
        d_loss_epoch = 0.0
        batches = 0

        for real_imgs, labels in loader:
            b_size = real_imgs.size(0)
            real_imgs = real_imgs.to(device)
            labels = labels.to(device)

            real_target = torch.ones(b_size, 1, device=device)
            fake_target = torch.zeros(b_size, 1, device=device)

            # ── Train Discriminator ──
            opt_d.zero_grad()
            out_real = discriminator(real_imgs, labels)
            d_loss_real = criterion(out_real, real_target)

            z = torch.randn(b_size, latent_dim, device=device)
            fake_imgs = generator(z, labels)
            out_fake = discriminator(fake_imgs.detach(), labels)
            d_loss_fake = criterion(out_fake, fake_target)

            d_loss = (d_loss_real + d_loss_fake) / 2.0
            d_loss.backward()
            opt_d.step()

            # ── Train Generator ──
            opt_g.zero_grad()
            out_gen = discriminator(fake_imgs, labels)
            g_loss = criterion(out_gen, real_target)
            g_loss.backward()
            opt_g.step()

            g_loss_epoch += g_loss.item()
            d_loss_epoch += d_loss.item()
            batches += 1

        avg_g = g_loss_epoch / max(1, batches)
        avg_d = d_loss_epoch / max(1, batches)
        print(f"  Epoch [{epoch+1}/{epochs}] | D_Loss: {avg_d:.4f} | G_Loss: {avg_g:.4f}")

    # Save checkpoints
    g_path = os.path.join(save_dir, "generator.pth")
    d_path = os.path.join(save_dir, "discriminator.pth")
    torch.save(generator.state_dict(), g_path)
    torch.save(discriminator.state_dict(), d_path)
    print(f"[GAN Trainer] Checkpoints saved to {g_path} and {d_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--num-samples", type=int, default=300)
    args = parser.parse_args()
    train_cgan(epochs=args.epochs, batch_size=args.batch_size, num_samples=args.num_samples)
