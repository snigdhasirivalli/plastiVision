import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Clock, Brain, Eye, ArrowRight, BarChart2 } from 'lucide-react';

const CNN_DATA = {
  name: 'Custom CNN',
  icon: '🧠',
  tagline: 'Convolutional Neural Network',
  badge: 'Production Model',
  badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-700',
  cardBorder: 'border-green-400/50 dark:border-green-600/40',
  accent: 'from-green-500 to-emerald-600',
  accentLight: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
  metrics: {
    accuracy: 95.63,
    precision: 95.81,
    recall: 95.63,
    f1: 95.70,
    trainTime: '5060 s',
    inferTime: '6.55 ms',
    params: '~4.2M',
    auc: 0.985,
  },
  strengths: [
    'Superior accuracy on plastic vs organic distinction',
    'Highly optimized for 224×224 waste images',
    'Robust to lighting and background variation',
    'Lower false-positive rate for non-biodegradable',
  ],
  architecture: [
    { label: 'Input', detail: '224×224 RGB' },
    { label: 'Conv Blocks', detail: '4 × (Conv2D → BN → ReLU → MaxPool)' },
    { label: 'Dropout', detail: '0.5 after dense layers' },
    { label: 'Dense', detail: '512 → 2 (Softmax)' },
    { label: 'Optimizer', detail: 'Adam, lr=0.001' },
    { label: 'Loss', detail: 'Sparse Categorical Crossentropy' },
  ],
};

const VIT_DATA = {
  name: 'Vision Transformer',
  icon: '🤖',
  tagline: 'ViT — Transformer Architecture',
  badge: 'Evaluated',
  badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  cardBorder: 'border-blue-400/40 dark:border-blue-600/30',
  accent: 'from-blue-500 to-indigo-600',
  accentLight: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
  metrics: {
    accuracy: 94.71,
    precision: 94.77,
    recall: 94.71,
    f1: 94.74,
    trainTime: '1367 s',
    inferTime: '3.52 ms',
    params: '~86M',
    auc: 0.971,
  },
  strengths: [
    'Faster inference — ideal for real-time mobile apps',
    '3.7× faster training convergence via attention',
    'Better at capturing global context in images',
    'More parameter-efficient per accuracy point',
  ],
  architecture: [
    { label: 'Input', detail: '224×224 → 16×16 patches' },
    { label: 'Embedding', detail: 'Patch + CLS + Position Embeddings' },
    { label: 'Encoder', detail: '12 × Transformer Encoder Blocks' },
    { label: 'Attention', detail: 'Multi-Head Self-Attention (8 heads)' },
    { label: 'Head', detail: 'MLP → 2 (Softmax)' },
    { label: 'Pretrained', detail: 'ImageNet-21k fine-tuned' },
  ],
};

const RADAR_METRICS = [
  { key: 'accuracy',  label: 'Accuracy'  },
  { key: 'precision', label: 'Precision' },
  { key: 'recall',    label: 'Recall'    },
  { key: 'f1',        label: 'F1 Score'  },
];

function MetricBar({ label, cnnVal, vitVal, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="mb-4"
    >
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="flex gap-4">
          <span className="text-green-600 dark:text-green-400 font-bold">{cnnVal}% CNN</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">{vitVal}% ViT</span>
        </span>
      </div>
      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${vitVal}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.1, duration: 0.8 }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-50"
        />
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${cnnVal}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2, duration: 0.8 }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
          style={{ height: '60%', top: '20%' }}
        />
      </div>
    </motion.div>
  );
}

function ModelCard({ model }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl border-2 ${model.cardBorder} bg-white dark:bg-gray-900 shadow-xl overflow-hidden flex flex-col`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-br ${model.accentLight} p-6 border-b border-gray-100 dark:border-gray-800`}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl">{model.icon}</span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${model.badgeColor}`}>
            {model.badge}
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white font-heading">{model.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{model.tagline}</p>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { label: 'Accuracy', val: `${model.metrics.accuracy}%` },
            { label: 'F1 Score', val: `${model.metrics.f1}%`      },
            { label: 'Infer Time', val: model.metrics.inferTime   },
            { label: 'Parameters', val: model.metrics.params      },
          ].map(s => (
            <div key={s.label} className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-2.5 text-center">
              <p className={`text-lg font-extrabold bg-gradient-to-r ${model.accent} bg-clip-text text-transparent font-heading`}>
                {s.val}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4" /> Architecture
        </h4>
        <div className="space-y-2">
          {model.architecture.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="font-semibold text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">{a.label}</span>
              <span className="text-gray-700 dark:text-gray-300">{a.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="p-6 flex-1">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Key Strengths
        </h4>
        <ul className="space-y-2">
          {model.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${model.accent} flex-shrink-0 mt-1.5`} />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function ModelComparison() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
            <BarChart2 className="w-4 h-4" /> Model Comparison
          </span>
          <h2 className="section-heading">
            CNN vs{' '}
            <span className="text-gradient-green">Vision Transformer</span>
          </h2>
          <p className="section-subheading max-w-2xl mx-auto">
            PlastiVision evaluated two cutting-edge deep learning architectures.
            See how they compare on accuracy, speed, and efficiency for waste classification.
          </p>

          {/* Tab Switcher */}
          <div className="flex justify-center mt-6">
            <div className="flex gap-1 p-1 rounded-xl bg-gray-200/70 dark:bg-gray-800/70">
              {[
                { id: 'overview',  label: 'Overview'     },
                { id: 'metrics',   label: 'Metrics'      },
                { id: 'tradeoffs', label: 'Trade-offs'   },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <ModelCard model={CNN_DATA} />
            <ModelCard model={VIT_DATA} />
          </div>
        )}

        {/* ── METRICS TAB ── */}
        {activeTab === 'metrics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            {/* Bar chart comparison */}
            <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-xl p-8">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-500" /> Performance Metrics
              </h3>
              <div className="flex gap-4 mb-6 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Custom CNN
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block opacity-60" /> ViT
                </span>
              </div>
              {RADAR_METRICS.map((m, i) => (
                <MetricBar
                  key={m.key}
                  label={m.label}
                  cnnVal={CNN_DATA.metrics[m.key]}
                  vitVal={VIT_DATA.metrics[m.key]}
                  delay={i * 0.1}
                />
              ))}
            </div>

            {/* Speed & Resources */}
            <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-xl p-8">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Speed & Resources
              </h3>
              <div className="space-y-5">
                {[
                  {
                    label: 'Inference Time',
                    cnn: CNN_DATA.metrics.inferTime,
                    vit: VIT_DATA.metrics.inferTime,
                    winner: 'vit',
                    icon: <Clock className="w-4 h-4" />,
                    note: 'ViT is ~1.9× faster at inference',
                  },
                  {
                    label: 'Training Time',
                    cnn: CNN_DATA.metrics.trainTime,
                    vit: VIT_DATA.metrics.trainTime,
                    winner: 'vit',
                    icon: <Clock className="w-4 h-4" />,
                    note: 'ViT converges ~3.7× faster',
                  },
                  {
                    label: 'Accuracy',
                    cnn: `${CNN_DATA.metrics.accuracy}%`,
                    vit: `${VIT_DATA.metrics.accuracy}%`,
                    winner: 'cnn',
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    note: 'CNN is +0.92% more accurate',
                  },
                  {
                    label: 'AUC Score',
                    cnn: CNN_DATA.metrics.auc,
                    vit: VIT_DATA.metrics.auc,
                    winner: 'cnn',
                    icon: <BarChart2 className="w-4 h-4" />,
                    note: 'CNN has better ROC curve separation',
                  },
                ].map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="text-gray-400 dark:text-gray-500">{row.icon}</div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{row.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{row.note}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className={`text-sm font-bold ${row.winner === 'cnn' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.cnn} {row.winner === 'cnn' && '✓'}
                      </div>
                      <div className={`text-sm font-bold ${row.winner === 'vit' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {row.vit} {row.winner === 'vit' && '✓'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TRADE-OFFS TAB ── */}
        {activeTab === 'tradeoffs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Head-to-head verdict */}
            <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl p-8 text-white">
              <h3 className="font-bold text-xl font-heading mb-6 text-center">⚖️ Head-to-Head Verdict</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-5 rounded-2xl bg-green-900/30 border border-green-700/40">
                  <p className="text-3xl mb-2">🧠</p>
                  <p className="font-bold text-green-300 mb-1">Best Accuracy</p>
                  <p className="text-2xl font-extrabold font-heading">Custom CNN</p>
                  <p className="text-green-400/80 text-sm mt-1">95.63% — Production choice</p>
                </div>
                <div className="text-center p-5 rounded-2xl bg-blue-900/30 border border-blue-700/40">
                  <p className="text-3xl mb-2">⚡</p>
                  <p className="font-bold text-blue-300 mb-1">Best Speed</p>
                  <p className="text-2xl font-extrabold font-heading">ViT</p>
                  <p className="text-blue-400/80 text-sm mt-1">3.52 ms — Mobile optimised</p>
                </div>
                <div className="text-center p-5 rounded-2xl bg-purple-900/30 border border-purple-700/40">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="font-bold text-purple-300 mb-1">Overall Winner</p>
                  <p className="text-2xl font-extrabold font-heading">Custom CNN</p>
                  <p className="text-purple-400/80 text-sm mt-1">Higher accuracy on this domain</p>
                </div>
              </div>
            </div>

            {/* Detailed trade-off table */}
            <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white font-heading">Detailed Trade-off Analysis</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aspect</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Custom CNN 🧠</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Vision Transformer 🤖</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Winner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { aspect: 'Classification Accuracy', cnn: '95.63%', vit: '94.71%', winner: 'CNN', wColor: 'text-green-600 dark:text-green-400' },
                      { aspect: 'Inference Speed',          cnn: '6.55 ms', vit: '3.52 ms', winner: 'ViT', wColor: 'text-blue-600 dark:text-blue-400' },
                      { aspect: 'Training Duration',        cnn: '5060 s', vit: '1367 s', winner: 'ViT', wColor: 'text-blue-600 dark:text-blue-400' },
                      { aspect: 'Model Parameters',         cnn: '~4.2 M', vit: '~86 M', winner: 'CNN', wColor: 'text-green-600 dark:text-green-400' },
                      { aspect: 'AUC Score',                cnn: '0.985', vit: '0.971', winner: 'CNN', wColor: 'text-green-600 dark:text-green-400' },
                      { aspect: 'Global Context Capture',   cnn: 'Limited (local receptive field)', vit: 'Excellent (attention)', winner: 'ViT', wColor: 'text-blue-600 dark:text-blue-400' },
                      { aspect: 'Deployment Size',          cnn: 'Lightweight', vit: 'Heavy (~330 MB)', winner: 'CNN', wColor: 'text-green-600 dark:text-green-400' },
                      { aspect: 'Production Use',           cnn: '✅ Active', vit: '🔬 Evaluated', winner: 'CNN', wColor: 'text-green-600 dark:text-green-400' },
                    ].map((row, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20'} hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-colors`}>
                        <td className="px-6 py-3.5 font-medium text-gray-700 dark:text-gray-300">{row.aspect}</td>
                        <td className="px-6 py-3.5 text-center text-gray-800 dark:text-gray-200">{row.cnn}</td>
                        <td className="px-6 py-3.5 text-center text-gray-800 dark:text-gray-200">{row.vit}</td>
                        <td className={`px-6 py-3.5 font-bold text-sm ${row.wColor}`}>{row.winner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/model-performance"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white font-bold shadow-lg transition-all hover:scale-105 group"
          >
            <Eye className="w-4 h-4" />
            View Full Model Performance Dashboard
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
