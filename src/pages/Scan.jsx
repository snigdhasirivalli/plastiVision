import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RotateCcw, Zap, X, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import ResultCard from '../components/ResultCard';
import AIAssistant from '../components/AIAssistant';
import CarbonImpactCard from '../components/CarbonImpactCard';

// ─── localStorage helpers for Dashboard live stats ────────────────────────────
function saveScanToStorage(result) {
  try {
    const today = new Date().toDateString();
    const key = 'pv_scans';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = {
      object: result.object,
      category: result.category,
      confidence: result.confidence,
      bin: result.bin,
      date: today,
      ts: Date.now(),
    };
    // Keep last 200 scans
    const updated = [entry, ...existing].slice(0, 200);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (_) {}
}

// ─── API call ─────────────────────────────────────────────────────────────────
import { predictImage } from '../services/api';
import { classifyImageClientSide } from '../services/aiClassifier';

const BACKEND_AVAILABLE_KEY = 'pv_backend_ok';

async function callPredictAPI(imageData, isBase64 = false) {
  let fileOrBlob;
  if (isBase64) {
    // Convert base64 dataURL to Blob for camera captures
    const res = await fetch(imageData);
    fileOrBlob = await res.blob();
  } else {
    fileOrBlob = imageData;
  }
  
  const data = await predictImage(fileOrBlob);
  return {
    object: data.detected_object,
    category: data.waste_category,
    confidence: parseFloat(data.confidence),
    bin: data.recommended_bin,
    tip: data.environmental_tip,
    time: data.prediction_time,
    engine: data.engine || 'PlastiVision AI Hybrid Engine',
  };
}

export default function Scan() {
  const [mode, setMode] = useState('upload'); // 'camera' | 'upload'
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  // Keep refs to the raw File object (upload) and base64 string (camera)
  const imageFileRef = useRef(null);
  const imageCaptureRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    imageFileRef.current = file;
    imageCaptureRef.current = null;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setApiError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    imageFileRef.current = file;
    imageCaptureRef.current = null;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setApiError(null);
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      imageCaptureRef.current = imageSrc;
      imageFileRef.current = null;
      setPreview(imageSrc);
      setResult(null);
      setApiError(null);
      setCameraActive(false);
    }
  }, []);

  const handlePredict = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setResult(null);
    setApiError(null);
    try {
      let r;
      try {
        if (imageCaptureRef.current) {
          // Camera capture — pass base64 dataURL
          r = await callPredictAPI(imageCaptureRef.current, true);
        } else if (imageFileRef.current) {
          // File upload — pass File object directly
          r = await callPredictAPI(imageFileRef.current, false);
        } else {
          throw new Error('No image available. Please upload or capture first.');
        }
      } catch (cloudErr) {
        console.warn('[PlastiVision] Primary inference error, executing Edge AI classification:', cloudErr);
        const source = imageCaptureRef.current || imageFileRef.current || preview;
        if (source) {
          const edge = await classifyImageClientSide(source);
          r = {
            object: edge.detected_object,
            category: edge.waste_category,
            confidence: parseFloat(edge.confidence),
            bin: edge.recommended_bin,
            tip: edge.environmental_tip,
            time: edge.prediction_time,
            engine: edge.engine || 'Edge AI (Instant Browser Inference)',
          };
        } else {
          throw cloudErr;
        }
      }
      saveScanToStorage(r);
      setResult(r);
    } catch (err) {
      console.error('[PlastiVision] Prediction error:', err);
      setApiError('Unable to analyze image. Please upload a clear image and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setApiError(null);
    setIsAnalyzing(false);
    setCameraActive(false);
    imageFileRef.current = null;
    imageCaptureRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold">
              🔍 AI Scan
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hybrid AI Engine Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            Scan Your <span className="text-gradient-green">Waste Item</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto">
            Upload an image or use your camera — our AI will classify the waste and recommend the correct disposal method.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── Left: Scanner Panel ─── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 rounded-xl bg-gray-200/70 dark:bg-gray-800/70 w-fit">
              <button
                onClick={() => { setMode('upload'); setCameraActive(false); }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'upload' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Upload</span>
              </button>
              <button
                onClick={() => { setMode('camera'); setCameraActive(true); setPreview(null); setResult(null); }}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'camera' ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <span className="flex items-center gap-1.5"><Camera className="w-4 h-4" /> Camera</span>
              </button>
            </div>

            {/* Camera / Upload Area */}
            <div
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm overflow-hidden relative"
              style={{ minHeight: '340px' }}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <AnimatePresence mode="wait">
                {mode === 'camera' && cameraActive && !preview ? (
                  <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full object-cover rounded-2xl"
                      style={{ maxHeight: '400px', objectFit: 'cover' }}
                      videoConstraints={{ facingMode: 'environment' }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 flex items-center justify-center gap-3">
                      <button onClick={handleCapture} className="btn-primary px-6 py-2.5">
                        <Camera className="w-4 h-4" /> Capture
                      </button>
                      <button onClick={() => setCameraActive(false)} className="px-4 py-2.5 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ) : preview ? (
                  <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative">
                    <img src={preview} alt="Preview" className="w-full object-contain rounded-2xl" style={{ maxHeight: '400px' }} />
                    <button
                      onClick={handleReset}
                      className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-80 p-8 cursor-pointer"
                    onClick={() => mode === 'upload' && fileInputRef.current?.click()}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/30 border-2 border-dashed border-primary-300 dark:border-primary-600 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary-500" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-base mb-1">
                      {mode === 'camera' ? 'Click "Camera" button to start' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-gray-400 text-sm">PNG, JPG, WEBP up to 10MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {mode === 'upload' && !preview && (
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
                  <Upload className="w-4 h-4" /> Upload Image
                </button>
              )}
              {mode === 'camera' && !cameraActive && !preview && (
                <button onClick={() => setCameraActive(true)} className="btn-secondary">
                  <Camera className="w-4 h-4" /> Open Camera
                </button>
              )}
              {mode === 'camera' && cameraActive && (
                <button onClick={handleCapture} className="btn-primary">
                  <Camera className="w-4 h-4" /> Capture
                </button>
              )}
              {preview && !isAnalyzing && !result && (
                <button onClick={handlePredict} className="btn-primary">
                  <Zap className="w-4 h-4" /> Predict
                </button>
              )}
              {(preview || isAnalyzing) && (
                <button onClick={handleReset} className="btn-outline">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>

            {/* Analyzing Animation */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-primary-900/50 to-blue-900/50 border border-primary-700/30 p-6 flex items-center gap-4"
                >
                  <div className="spinner" />
                  <div>
                    <p className="text-white font-semibold font-heading">Analyzing Image...</p>
                    <p className="text-primary-300 text-sm">Running PlastiVision AI classification pipeline</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* API Error Banner */}
            <AnimatePresence>
              {apiError && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl bg-red-900/40 border border-red-500/40 p-5 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Prediction Failed</p>
                    <p className="text-red-400/80 text-xs mt-0.5">{apiError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Card */}
            <AnimatePresence>
              {result && !isAnalyzing && (
                <ResultCard result={result} />
              )}
            </AnimatePresence>
          </div>

          {/* ─── Right: Sidebar ─── */}
          <div className="space-y-5">
            <AIAssistant result={result} />
            <CarbonImpactCard />

            {/* Tips Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-700/30 p-5"
            >
              <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                💡 Scanning Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                <li>• Ensure good lighting for best results</li>
                <li>• Place object on a plain background</li>
                <li>• Keep the object centered in frame</li>
                <li>• Avoid blurry or low-resolution images</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
