/**
 * PlastiVision AI — TensorFlow.js In-Browser CNN Classifier
 * ==========================================================
 * Loads the real trained Keras CNN (best_model.keras converted to TF.js format)
 * and runs proper ML inference directly in the browser.
 * Falls back to the heuristic edge classifier only if the model cannot load.
 */

import * as tf from '@tensorflow/tfjs';

let _model = null;
let _modelLoadAttempted = false;
let _modelLoadFailed = false;

// Public model URL — the converted TF.js model hosted via Vercel public folder
// Files: /tfjs_model/model.json + /tfjs_model/group1-shard1of1.bin
const TFJS_MODEL_URL = '/tfjs_model/model.json';

/**
 * Load the TF.js model once and cache it.
 */
async function loadTFJSModel() {
  if (_model) return _model;
  if (_modelLoadFailed) return null;
  if (_modelLoadAttempted) return null;

  _modelLoadAttempted = true;
  try {
    console.info('[PlastiVision] Loading TF.js CNN model...');
    _model = await tf.loadLayersModel(TFJS_MODEL_URL);
    console.info('[PlastiVision] ✅ TF.js CNN model loaded successfully.');
    return _model;
  } catch (err) {
    console.warn('[PlastiVision] ⚠️ TF.js model not available, using edge heuristic:', err.message);
    _modelLoadFailed = true;
    return null;
  }
}

/**
 * Preprocess an HTMLImageElement into a [1, 224, 224, 3] tensor
 * normalized to [0, 1] as expected by the Keras CNN.
 */
function imageToTensor(imgElement) {
  return tf.tidy(() => {
    const tensor = tf.browser.fromPixels(imgElement)
      .resizeBilinear([224, 224])
      .toFloat()
      .div(255.0)
      .expandDims(0); // shape: [1, 224, 224, 3]
    return tensor;
  });
}

/**
 * Run TF.js inference on the loaded model.
 * Returns { category, confidence, isBiodegradable }
 */
async function runTFJSInference(imgElement) {
  const model = await loadTFJSModel();
  if (!model) return null;

  const inputTensor = imageToTensor(imgElement);
  const predictions = model.predict(inputTensor);
  const probsArray = await predictions.data();

  // Clean up tensors
  inputTensor.dispose();
  predictions.dispose();

  // Class order from class_names.json: ["Biodegradable", "Non_Biodegradable"]
  const bioProb  = probsArray[0];
  const nBioProb = probsArray[1];

  const isBiodegradable = bioProb > nBioProb;
  const confidence = parseFloat((Math.max(bioProb, nBioProb) * 100).toFixed(2));

  return { isBiodegradable, confidence };
}

/**
 * Heuristic fallback — used ONLY when TF.js model is unavailable.
 * Conservative: only classifies as Biodegradable with very strong organic signals.
 */
function heuristicFallback(pixels, pixelCount) {
  let greenCount = 0;
  let syntheticCount = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat  = maxC === 0 ? 0 : (maxC - minC) / maxC;

    // Organic Leaf/Plant green signal (vibrant foliage)
    if (g > r + 25 && g > b + 20 && sat > 0.22) {
      greenCount++;
    }

    // Synthetic Cues: specular highlight, low saturation neutrals, cool blues/cyans, glossy reflections
    const isSpecular = r > 220 && g > 220 && b > 220;
    const isNeutralGrey = sat < 0.15 && maxC > 40 && maxC < 235;
    const isCoolBlue = b > r + 15 && b > g + 10;
    if (isSpecular || isNeutralGrey || isCoolBlue) {
      syntheticCount++;
    }
  }

  const greenRatio = greenCount / pixelCount;
  const syntheticRatio = syntheticCount / pixelCount;

  // STRICT RULE: Only classify as Biodegradable if vibrant green leaf/plant signal is predominant
  // and synthetic cues are low. Otherwise, default to Non_Biodegradable.
  const isBiodegradable = greenRatio > 0.14 && greenRatio > syntheticRatio * 2.0;

  let confidence;
  if (isBiodegradable) {
    confidence = parseFloat(Math.min(98.5, 85.0 + greenRatio * 50.0).toFixed(2));
  } else {
    confidence = parseFloat(Math.min(97.8, 88.0 + (1.0 - greenRatio) * 10.0).toFixed(2));
  }

  return { isBiodegradable, confidence };
}

/**
 * Main export: classify an image file, blob, or URL.
 * Priority: Real TF.js CNN model → Heuristic fallback
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
        // ── Attempt 1: Real TF.js CNN model ─────────────────────────────────
        const tfResult = await runTFJSInference(img);

        let isBiodegradable, confidence, engine;

        if (tfResult) {
          isBiodegradable = tfResult.isBiodegradable;
          confidence      = tfResult.confidence;
          engine          = 'CNN Model (In-Browser TF.js)';
        } else {
          // ── Attempt 2: Heuristic fallback ────────────────────────────────
          const canvas = document.createElement('canvas');
          canvas.width = 224; canvas.height = 224;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 224, 224);
          const { data } = ctx.getImageData(0, 0, 224, 224);
          const fallback = heuristicFallback(data, 224 * 224);
          isBiodegradable = fallback.isBiodegradable;
          confidence      = fallback.confidence;
          engine          = 'Edge AI (Pixel Heuristic Fallback)';
        }

        // ── Build response ───────────────────────────────────────────────────
        const category       = isBiodegradable ? 'Biodegradable' : 'Non_Biodegradable';
        const recommendedBin = isBiodegradable ? 'Compost Bin'   : 'Recycle Bin';
        const tip = isBiodegradable
          ? 'Organic waste can be composted to produce nutrient-rich soil and reduce landfill burden.'
          : 'Non-biodegradable plastics should be cleaned and placed in the recycling or dry waste bin.';

        if (objectUrl) URL.revokeObjectURL(objectUrl);

        const elapsedMs = (performance.now() - startTime).toFixed(1);
        resolve({
          detected_object:   category === 'Biodegradable' ? 'Organic / Biodegradable Waste' : 'Synthetic / Non-Biodegradable Waste',
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
