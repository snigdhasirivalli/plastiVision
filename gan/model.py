"""
PlastiVision AI — GAN Model Architecture & Adversarial Integration
==================================================================
Implements:
1. Conditional GAN (Generator & Discriminator):
   - Generates synthetic waste images conditioned on class (0: Biodegradable, 1: Non-Biodegradable).
   - Used for data augmentation and synthetic distribution evaluation.
2. Adversarial Perturbation GAN (AdvGAN Generator):
   - Generates bounded perturbations delta in [-eps, eps] to stress-test the downstream
     Deep Learning Classifier (ViT / CNN) in accordance with the
     "Test and Evaluation of Artificial Intelligence Models Framework" (DoD CDAO).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


# ─── 1. CONDITIONAL DCGAN GENERATOR ──────────────────────────────────────────

class ConditionalGenerator(nn.Module):
    """
    Conditional Generator: Maps noise vector z ~ N(0, I) and class label y to an image.
    Architecture uses Transposed Convolutions with BatchNorm and ReLU, ending in Tanh.
    Output: [B, 3, 64, 64] image in range [-1, 1].
    """
    def __init__(self, latent_dim: int = 100, num_classes: int = 2, embed_dim: int = 32, feature_maps: int = 64):
        super().__init__()
        self.latent_dim = latent_dim
        self.num_classes = num_classes
        self.label_embedding = nn.Embedding(num_classes, embed_dim)

        in_dim = latent_dim + embed_dim

        self.net = nn.Sequential(
            # Input is (latent_dim + embed_dim) x 1 x 1
            nn.ConvTranspose2d(in_dim, feature_maps * 8, kernel_size=4, stride=1, padding=0, bias=False),
            nn.BatchNorm2d(feature_maps * 8),
            nn.ReLU(True),
            # Shape: [B, feature_maps * 8, 4, 4]

            nn.ConvTranspose2d(feature_maps * 8, feature_maps * 4, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 4),
            nn.ReLU(True),
            # Shape: [B, feature_maps * 4, 8, 8]

            nn.ConvTranspose2d(feature_maps * 4, feature_maps * 2, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 2),
            nn.ReLU(True),
            # Shape: [B, feature_maps * 2, 16, 16]

            nn.ConvTranspose2d(feature_maps * 2, feature_maps, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps),
            nn.ReLU(True),
            # Shape: [B, feature_maps, 32, 32]

            nn.ConvTranspose2d(feature_maps, 3, kernel_size=4, stride=2, padding=1, bias=False),
            nn.Tanh()
            # Shape: [B, 3, 64, 64] in [-1, 1]
        )

    def forward(self, z: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        batch_size = z.size(0)
        label_emb = self.label_embedding(labels).unsqueeze(2).unsqueeze(3) # [B, embed_dim, 1, 1]
        z = z.view(batch_size, self.latent_dim, 1, 1)                      # [B, latent_dim, 1, 1]
        x = torch.cat([z, label_emb], dim=1)                                # [B, in_dim, 1, 1]
        return self.net(x)


# ─── 2. CONDITIONAL DISCRIMINATOR ─────────────────────────────────────────────

class ConditionalDiscriminator(nn.Module):
    """
    Conditional Discriminator: Classifies (image, label) pair as real or synthetic.
    Uses LeakyReLU, BatchNorm, and outputs a probability score in [0, 1].
    """
    def __init__(self, num_classes: int = 2, feature_maps: int = 64):
        super().__init__()
        self.num_classes = num_classes
        self.label_embedding = nn.Embedding(num_classes, 64 * 64)

        # 3 image channels + 1 channel for spatial label map
        self.net = nn.Sequential(
            nn.Conv2d(4, feature_maps, kernel_size=4, stride=2, padding=1),
            nn.LeakyReLU(0.2, inplace=True),
            # Shape: [B, feature_maps, 32, 32]

            nn.Conv2d(feature_maps, feature_maps * 2, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 2),
            nn.LeakyReLU(0.2, inplace=True),
            # Shape: [B, feature_maps * 2, 16, 16]

            nn.Conv2d(feature_maps * 2, feature_maps * 4, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 4),
            nn.LeakyReLU(0.2, inplace=True),
            # Shape: [B, feature_maps * 4, 8, 8]

            nn.Conv2d(feature_maps * 4, feature_maps * 8, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(feature_maps * 8),
            nn.LeakyReLU(0.2, inplace=True),
            # Shape: [B, feature_maps * 8, 4, 4]

            nn.Conv2d(feature_maps * 8, 1, kernel_size=4, stride=1, padding=0, bias=False),
            nn.Sigmoid()
            # Shape: [B, 1, 1, 1]
        )

    def forward(self, images: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        batch_size = images.size(0)
        label_map = self.label_embedding(labels).view(batch_size, 1, 64, 64)
        x = torch.cat([images, label_map], dim=1)  # [B, 4, 64, 64]
        return self.net(x).view(batch_size, 1)


# ─── 3. ADVERSARIAL PERTURBATION GENERATOR (AdvGAN) ───────────────────────────

class AdversarialPerturbationGenerator(nn.Module):
    """
    AdvGAN Perturbation Generator:
    Takes an input waste image I and generates a bounded perturbation delta in [-epsilon, epsilon].
    This enables Adversarial Robustness Testing (T&E Framework Page 13 & 22)
    to probe decision boundaries of the downstream deep learning classifier.
    """
    def __init__(self, epsilon: float = 0.08):
        super().__init__()
        self.epsilon = epsilon
        # Encoder-Decoder ResNet-style perturbation generator
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=1, padding=1),
            nn.InstanceNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU(inplace=True),
        )

        # Residual Block
        self.res = nn.Sequential(
            nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, stride=1, padding=1),
            nn.InstanceNorm2d(128),
        )

        # Decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, kernel_size=3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, kernel_size=3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 3, kernel_size=3, stride=1, padding=1),
            nn.Tanh()  # Output in [-1, 1]
        )

    def forward(self, x: torch.Tensor, eps: float = None) -> torch.Tensor:
        """
        Generates perturbation delta and returns perturbed image x_adv = clip(x + delta, 0, 1).
        x is expected in [0, 1].
        """
        current_eps = eps if eps is not None else self.epsilon
        feats = self.encoder(x)
        res_feats = F.relu(feats + self.res(feats))
        raw_delta = self.decoder(res_feats)  # [-1, 1]
        delta = raw_delta * current_eps      # [-eps, eps]
        x_adv = torch.clamp(x + delta, 0.0, 1.0)
        return x_adv, delta


# ─── 4. INTEGRATED GAN + DOWNSTREAM CLASSIFIER PIPELINE ───────────────────────

class GANClassifierPipeline:
    """
    High-level integration wrapper pairing GAN models with the Downstream Classifier.
    Supports:
    1. Synthetic sample generation conditioned on waste class.
    2. Adversarial perturbation stress-testing.
    3. Joint evaluation in accordance with the T&E Framework.
    """
    def __init__(
        self,
        classifier: nn.Module,
        generator: ConditionalGenerator = None,
        adv_generator: AdversarialPerturbationGenerator = None,
        device: str = "cpu"
    ):
        self.classifier = classifier.to(device).eval()
        self.generator = (generator or ConditionalGenerator()).to(device).eval()
        self.adv_generator = (adv_generator or AdversarialPerturbationGenerator()).to(device).eval()
        self.device = device

    def generate_synthetic(self, num_samples: int, class_label: int) -> torch.Tensor:
        """Generates synthetic samples for a specific class [0: Bio, 1: Non-Bio] resized to [B, 3, 224, 224]."""
        self.generator.eval()
        with torch.no_grad():
            z = torch.randn(num_samples, self.generator.latent_dim, device=self.device)
            labels = torch.full((num_samples,), class_label, dtype=torch.long, device=self.device)
            gen_imgs = self.generator(z, labels) # [-1, 1], shape [B, 3, 64, 64]
            # Rescale to [0, 1] and interpolate to classifier input size (224x224)
            gen_imgs_norm = (gen_imgs + 1.0) / 2.0
            gen_imgs_224 = F.interpolate(gen_imgs_norm, size=(224, 224), mode="bilinear", align_corners=False)
            return gen_imgs_224

    def attack_and_classify(self, images: torch.Tensor, eps: float = 0.08):
        """
        Applies GAN-generated adversarial perturbation to images and runs downstream classification.
        Returns:
            clean_preds, clean_probs, adv_preds, adv_probs, x_adv, delta
        """
        self.classifier.eval()
        self.adv_generator.eval()

        images = images.to(self.device)
        with torch.no_grad():
            # Clean inference
            clean_logits = self.classifier(images)
            clean_probs = F.softmax(clean_logits, dim=1)
            clean_preds = clean_logits.argmax(dim=1)

            # Adversarial perturbation
            x_adv, delta = self.adv_generator(images, eps=eps)

            # Adversarial inference
            adv_logits = self.classifier(x_adv)
            adv_probs = F.softmax(adv_logits, dim=1)
            adv_preds = adv_logits.argmax(dim=1)

        return clean_preds, clean_probs, adv_preds, adv_probs, x_adv, delta
