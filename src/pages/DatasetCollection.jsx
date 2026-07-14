import React from 'react';
import { motion } from 'framer-motion';
import { Database, Scissors, Zap, Layers, Scale, FlaskConical, Globe, Sliders, ChevronRight } from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: Database, label: 'Dataset Collection', color: 'from-blue-500 to-blue-700' },
  { icon: Scissors, label: 'Preprocessing', color: 'from-indigo-500 to-indigo-700' },
  { icon: Zap, label: 'Data Augmentation', color: 'from-purple-500 to-purple-700' },
  { icon: Layers, label: 'Model Training', color: 'from-primary-500 to-primary-700' },
  { icon: Sliders, label: 'Hyperparameter Tuning', color: 'from-teal-500 to-teal-700' },
  { icon: Scale, label: 'Model Evaluation', color: 'from-cyan-500 to-cyan-700' },
  { icon: FlaskConical, label: 'Real-Time Prediction', color: 'from-amber-500 to-orange-600' },
  { icon: Globe, label: 'Web Deployment', color: 'from-rose-500 to-red-700' },
];

const NOISE_EXAMPLES = [
  { label: 'Blur', emoji: '🌫️', desc: 'Images with motion/focus blur' },
  { label: 'Low Light', emoji: '🌑', desc: 'Underexposed, dark images' },
  { label: 'Backgrounds', emoji: '🎭', desc: 'Varied cluttered backgrounds' },
  { label: 'Viewing Angles', emoji: '🔄', desc: 'Multiple perspective angles' },
  { label: 'Rotation', emoji: '↻', desc: 'Objects in different orientations' },
  { label: 'Occlusion', emoji: '🙈', desc: 'Partially hidden waste items' },
];

const AUGMENTATIONS = [
  { label: 'Rotation', emoji: '🔃', desc: 'Rotate images up to ±40°' },
  { label: 'Brightness', emoji: '☀️', desc: 'Vary exposure levels' },
  { label: 'Contrast', emoji: '🌗', desc: 'Adjust contrast range' },
  { label: 'Zoom', emoji: '🔍', desc: 'Random zoom in/out' },
  { label: 'Horizontal Flip', emoji: '↔️', desc: 'Mirror horizontally' },
  { label: 'Translation', emoji: '➡️', desc: 'Shift image position' },
  { label: 'Random Crop', emoji: '✂️', desc: 'Crop random sections' },
  { label: 'Gaussian Noise', emoji: '📡', desc: 'Add random pixel noise' },
];

const DATA_STEPS = [
  { title: 'Self-Collected Images', desc: 'Images captured by the team using smartphones under diverse conditions including different lighting, backgrounds, and angles.' },
  { title: 'Public Dataset Images', desc: 'Supplemented with images from open-source datasets such as Kaggle Waste Dataset, ensuring broader class coverage and diversity.' },
  { title: 'Data Cleaning', desc: 'Removed duplicate, corrupted, and mislabeled images. Verified all class labels manually for accuracy.' },
  { title: 'Image Resizing', desc: 'All images resized to 224×224 pixels to match MobileNetV2 input requirements while preserving aspect ratio.' },
  { title: 'Train / Val / Test Split', desc: '80% training, 10% validation, 10% testing — ensuring an unbiased evaluation of model generalization.' },
];

export default function DatasetCollection() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
            📦 Dataset Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            How the <span className="text-gradient-green">Dataset</span> Was Built
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            A comprehensive pipeline from raw image collection to a deployment-ready deep learning dataset.
          </p>
        </motion.div>

        {/* Project Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8 mb-10"
        >
          <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-8 text-center">Project Pipeline</h2>
          <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
            {PIPELINE_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center max-w-[80px] leading-tight">{step.label}</span>
                </motion.div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div key={step.label} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{step.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Collection Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {DATA_STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold flex items-center justify-center mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Noise Handling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8 mb-10"
        >
          <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2">Noise Handling</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            The dataset includes challenging conditions to make the model robust and reliable in real-world scenarios.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NOISE_EXAMPLES.map((n, i) => (
              <motion.div
                key={n.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center gap-3"
              >
                <span className="text-3xl">{n.emoji}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{n.label}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{n.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200/50 dark:border-primary-700/30 p-4">
            <p className="text-primary-700 dark:text-primary-300 text-sm">
              ✅ <strong>Result:</strong> Exposure to diverse noise conditions during training significantly improves model robustness, enabling accurate predictions even on imperfect real-world images.
            </p>
          </div>
        </motion.div>

        {/* Data Augmentation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8"
        >
          <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2">Data Augmentation</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Applied during training using Keras ImageDataGenerator to artificially expand the training dataset and prevent overfitting.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {AUGMENTATIONS.map((aug, i) => (
              <motion.div
                key={aug.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-xl bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/10 border border-primary-200/40 dark:border-primary-700/20 p-4 text-center cursor-default"
              >
                <span className="text-3xl">{aug.emoji}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-2 mb-1">{aug.label}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{aug.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
