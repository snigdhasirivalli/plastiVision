/**
 * PlastiVision AI — TensorFlow.js In-Browser Neural Network Classifier
 * ====================================================================
 * Runs the real trained models directly in the browser:
 *   1. Vision Transformer (PlastiVision_Vision_Transformer, 411,714 params) — primary
 *   2. Custom CNN (PlastiVision_Custom_CNN, 456,642 params) — fallback
 * Both forward passes were verified numerically identical to their Keras originals.
 */

import * as tf from '@tensorflow/tfjs';

let _model = null;
let _modelLoadingPromise = null;
let _vitWeights = null;
let _vitLoadingPromise = null;

/**
 * Builds the exact PlastiVision CNN architecture in TF.js
 * and populates it with the trained weight tensors.
 */
async function buildAndLoadTrainedCNN() {
  console.info('[PlastiVision AI] Constructing Deep Neural Network graph...');

  const model = tf.sequential({
    name: 'PlastiVision_Custom_CNN',
    layers: [
      // Conv Block 1
      tf.layers.conv2d({ inputShape: [224, 224, 3], filters: 32, kernelSize: 3, padding: 'same', name: 'conv2d_1' }),
      tf.layers.batchNormalization({ name: 'batch_norm_1' }),
      tf.layers.activation({ activation: 'relu', name: 'relu_1' }),
      tf.layers.maxPooling2d({ poolSize: [2, 2], name: 'max_pooling_1' }),

      // Conv Block 2
      tf.layers.conv2d({ filters: 64, kernelSize: 3, padding: 'same', name: 'conv2d_2' }),
      tf.layers.batchNormalization({ name: 'batch_norm_2' }),
      tf.layers.activation({ activation: 'relu', name: 'relu_2' }),
      tf.layers.maxPooling2d({ poolSize: [2, 2], name: 'max_pooling_2' }),

      // Conv Block 3
      tf.layers.conv2d({ filters: 128, kernelSize: 3, padding: 'same', name: 'conv2d_3' }),
      tf.layers.batchNormalization({ name: 'batch_norm_3' }),
      tf.layers.activation({ activation: 'relu', name: 'relu_3' }),
      tf.layers.maxPooling2d({ poolSize: [2, 2], name: 'max_pooling_3' }),

      // Conv Block 4
      tf.layers.conv2d({ filters: 256, kernelSize: 3, padding: 'same', name: 'conv2d_4' }),
      tf.layers.batchNormalization({ name: 'batch_norm_4' }),
      tf.layers.activation({ activation: 'relu', name: 'relu_4' }),

      // Classification Head
      tf.layers.globalAveragePooling2d({ name: 'global_avg_pooling' }),
      tf.layers.dense({ units: 256, activation: 'relu', name: 'dense_256' }),
      tf.layers.dropout({ rate: 0.5, name: 'dropout_0.5' }),
      tf.layers.dense({ units: 2, activation: 'softmax', name: 'output_softmax' }),
    ]
  });

  // Fetch manifest and binary weights
  const [manifestRes, weightsRes] = await Promise.all([
    fetch('/tfjs_model/manifest.json'),
    fetch('/tfjs_model/weights.bin')
  ]);

  if (!manifestRes.ok || !weightsRes.ok) {
    throw new Error(`Failed to load weight assets: ${manifestRes.status} / ${weightsRes.status}`);
  }

  const manifest = await manifestRes.json();
  const weightsBuffer = await weightsRes.arrayBuffer();

  // Map weights to model layers
  tf.tidy(() => {
    manifest.forEach(spec => {
      const layer = model.getLayer(spec.layer);
      if (!layer) return;

      const floatSlice = new Float32Array(weightsBuffer, spec.offset, spec.size);
      const weightTensor = tf.tensor(floatSlice, spec.shape, 'float32');

      // Set weights per layer
      const currentWeights = layer.getWeights();
      if (currentWeights.length > spec.weight_index) {
        currentWeights[spec.weight_index] = weightTensor;
        layer.setWeights(currentWeights);
      }
    });
  });

  console.info('[PlastiVision AI] ✅ Trained CNN neural network loaded successfully into browser memory!');
  return model;
}

/**
 * Load and cache the trained TF.js CNN model
 */
async function loadTFJSModel() {
  if (_model) return _model;
  if (_modelLoadingPromise) return _modelLoadingPromise;

  _modelLoadingPromise = (async () => {
    try {
      // Primary: Try standard tf.loadLayersModel
      console.info('[PlastiVision AI] Attempting standard TF.js model load...');
      _model = await tf.loadLayersModel('/tfjs_model/model.json');
      console.info('[PlastiVision AI] ✅ Loaded model via loadLayersModel');
      return _model;
    } catch (err1) {
      console.warn('[PlastiVision AI] Standard load failed, executing custom neural net weights loader:', err1.message);
      try {
        _model = await buildAndLoadTrainedCNN();
        return _model;
      } catch (err2) {
        console.error('[PlastiVision AI] Deep neural network loading error:', err2);
        _modelLoadingPromise = null;
        return null;
      }
    }
  })();

  return _modelLoadingPromise;
}

/**
 * Preprocess an HTMLImageElement into a [1, 224, 224, 3] tensor
 * normalized to [0, 1] as expected by the trained Keras CNN.
 */
function imageToTensor(imgElement) {
  return tf.tidy(() => {
    return tf.browser.fromPixels(imgElement)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims(0); // [1, 224, 224, 3]
  });
}

/**
 * Run TF.js inference using the trained CNN.
 * Class order from class_names.json: ["Biodegradable", "Non_Biodegradable"]
 */
async function runTFJSInference(imgElement) {
  const model = await loadTFJSModel();
  if (!model) {
    throw new Error('Neural network failed to load in this browser');
  }

  const inputTensor = imageToTensor(imgElement);
  const predictions = model.predict(inputTensor);
  const probsArray = await predictions.data();

  // Clean up tensors
  inputTensor.dispose();
  predictions.dispose();

  const bioProb  = probsArray[0];
  const nBioProb = probsArray[1];

  const isBiodegradable = bioProb > nBioProb;
  const confidence = parseFloat((Math.max(bioProb, nBioProb) * 100).toFixed(2));

  return { isBiodegradable, confidence, bioProb, nBioProb };
}

// ── Vision Transformer (primary engine) ─────────────────────────────────────
// Custom Keras ViT: 16x16 patches → 196 tokens, d_model 64, 4 encoder blocks
// (4-head self-attention, gelu FFN), global average pooling, classifier head.
// Weight layout exported from Keras by index:
//   0: patch proj kernel [768,64]   1: patch proj bias [64]   2: pos emb [196,64]
//   per block (base = 3 + b*16): norm1 γ/β, attention q/k/v/out kernels+biases,
//   norm2 γ/β, FFN dense kernels+biases
//   67: head kernel [64,256]  68: head bias  69: logits kernel [256,2]  70: bias

const VIT_HEADS = 4;
const VIT_HEAD_DIM = 64;
const VIT_D_MODEL = 64;
const VIT_NUM_PATCHES = 196;

async function loadVitWeights() {
  if (_vitWeights) return _vitWeights;
  if (_vitLoadingPromise) return _vitLoadingPromise;

  _vitLoadingPromise = (async () => {
    try {
      console.info('[PlastiVision AI] Loading Vision Transformer weights...');
      const [manifestRes, weightsRes] = await Promise.all([
        fetch('/tfjs_model_vit/manifest.json'),
        fetch('/tfjs_model_vit/weights.bin'),
      ]);
      if (!manifestRes.ok || !weightsRes.ok) {
        throw new Error(`Failed to load ViT assets: ${manifestRes.status} / ${weightsRes.status}`);
      }
      const manifest = await manifestRes.json();
      const buffer = await weightsRes.arrayBuffer();
      _vitWeights = manifest.map(spec =>
        tf.tensor(new Float32Array(buffer, spec.offset, spec.size), spec.shape, 'float32')
      );
      console.info('[PlastiVision AI] ✅ Trained Vision Transformer loaded into browser memory!');
      return _vitWeights;
    } catch (err) {
      console.error('[PlastiVision AI] ViT loading error:', err);
      _vitLoadingPromise = null;
      return null;
    }
  })();

  return _vitLoadingPromise;
}

function vitLayerNorm(x, gamma, beta) {
  const { mean, variance } = tf.moments(x, -1, true);
  return x.sub(mean).div(variance.add(1e-6).sqrt()).mul(gamma).add(beta);
}

function vitDense(x, kernel, bias) {
  return x.matMul(kernel).add(bias);
}

function vitGelu(x) {
  return x.mul(0.5).mul(tf.erf(x.div(Math.SQRT2)).add(1)).cast('float32');
}

function vitSelfAttention(x, batchSize, w) {
  // w = [qk, qb, kk, kb, vk, vb, ok, ob] with Keras 3 MHA shapes:
  // q/k/v kernels [64, 4, 64] (input, head, head_dim), output kernel [4, 64, 64]
  const project = (src, kernel, bias) =>
    vitDense(src, kernel.reshape([VIT_D_MODEL, VIT_HEADS * VIT_HEAD_DIM]), bias.reshape([VIT_HEADS * VIT_HEAD_DIM]))
      .reshape([batchSize, VIT_NUM_PATCHES, VIT_HEADS, VIT_HEAD_DIM])
      .transpose([0, 2, 1, 3]);

  const q = project(x, w[0], w[1]);
  const k = project(x, w[2], w[3]);
  const v = project(x, w[4], w[5]);

  const scores = tf.matMul(q, k, false, true).div(Math.sqrt(VIT_HEAD_DIM)).softmax(-1);
  const context = tf.matMul(scores, v)
    .transpose([0, 2, 1, 3])
    .reshape([batchSize, VIT_NUM_PATCHES, VIT_HEADS * VIT_HEAD_DIM]);

  return vitDense(context, w[6].reshape([VIT_HEADS * VIT_HEAD_DIM, VIT_D_MODEL]), w[7]);
}

function vitForward(input) {
  return tf.tidy(() => {
    const W = _vitWeights;
    // Patch embedding: Dense(768→64) over flattened 16x16x3 patches is exactly
    // a Conv2D with kernel [16,16,3,64] and stride 16 over the image.
    let x = tf.conv2d(input, W[0].reshape([16, 16, 3, VIT_D_MODEL]), [16, 16], 'valid')
      .add(W[1])
      .reshape([1, VIT_NUM_PATCHES, VIT_D_MODEL])
      .add(W[2]);

    const batchSize = input.shape[0];
    for (let block = 0; block < 4; block++) {
      const base = 3 + block * 16;
      const i = n => W[base + n];

      const attended = vitSelfAttention(vitLayerNorm(x, i(0), i(1)), batchSize, [i(2), i(3), i(4), i(5), i(6), i(7), i(8), i(9)]);
      x = x.add(attended);

      const ffnIn = vitLayerNorm(x, i(10), i(11));
      const ffn = vitDense(vitGelu(vitDense(ffnIn, i(12), i(13))), i(14), i(15));
      x = x.add(ffn);
    }

    const pooled = x.mean(1);
    const hidden = tf.relu(vitDense(pooled, W[67], W[68]));
    return vitDense(hidden, W[69], W[70]).softmax(-1);
  });
}

/**
 * Run TF.js inference using the trained Vision Transformer.
 */
async function runVitInference(imgElement) {
  const weights = await loadVitWeights();
  if (!weights) {
    throw new Error('Vision Transformer failed to load in this browser');
  }

  const inputTensor = imageToTensor(imgElement);
  const predictions = vitForward(inputTensor);
  const probsArray = await predictions.data();

  inputTensor.dispose();
  predictions.dispose();

  const bioProb  = probsArray[0];
  const nBioProb = probsArray[1];

  const isBiodegradable = bioProb > nBioProb;
  const confidence = parseFloat((Math.max(bioProb, nBioProb) * 100).toFixed(2));

  return { isBiodegradable, confidence, bioProb, nBioProb };
}

/**
 * Main export: classify an image using the trained deep learning neural network.
 */
export async function classifyImageClientSide(fileOrBlobOrUrl) {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    let objectUrl = null;
    let imgSrc = '';

    if (typeof fileOrBlobOrUrl === 'string') {
      imgSrc = fileOrBlobOrUrl;
    } else if (fileOrBlobOrUrl instanceof Blob || fileOrBlobOrUrl instanceof File) {
      objectUrl = URL.createObjectURL(fileOrBlobOrUrl);
      imgSrc = objectUrl;
    } else {
      return reject(new Error('Invalid image input'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // Primary: trained Vision Transformer; fallback: trained CNN.
        // Both throw if their network failed to load, letting callers
        // fall back to network prediction tiers.
        let tfResult = null;
        let engine = null;
        const failures = [];

        try {
          tfResult = await runVitInference(img);
          engine = 'Trained Vision Transformer (In-Browser TF.js)';
        } catch (vitErr) {
          failures.push(`ViT: ${vitErr.message}`);
        }

        if (!tfResult) {
          try {
            tfResult = await runTFJSInference(img);
            engine = 'Trained CNN Neural Network (In-Browser TF.js)';
          } catch (cnnErr) {
            failures.push(`CNN: ${cnnErr.message}`);
          }
        }

        if (!tfResult) {
          throw new Error(`Neural networks failed to load (${failures.join('; ')})`);
        }

        const isBiodegradable = tfResult.isBiodegradable;
        const confidence      = tfResult.confidence;

        const category       = isBiodegradable ? 'Biodegradable' : 'Non_Biodegradable';
        const recommendedBin = isBiodegradable ? 'Compost Bin'   : 'Recycle Bin';
        const tip = isBiodegradable
          ? 'Organic waste can be composted to produce nutrient-rich soil.'
          : 'Plastics and synthetic non-biodegradable waste should be cleaned and placed in the recycling bin.';

        if (objectUrl) URL.revokeObjectURL(objectUrl);

        const elapsedMs = (performance.now() - startTime).toFixed(1);
        resolve({
          detected_object:   category === 'Biodegradable' ? 'Organic / Biodegradable Waste' : 'Synthetic Plastic / Non-Biodegradable Waste',
          waste_category:    category,
          confidence,
          recommended_bin:   recommendedBin,
          environmental_tip: tip,
          prediction_time:   `${elapsedMs} ms`,
          engine,
          success:           true,
        });
      } catch (err) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = imgSrc;
  });
}
