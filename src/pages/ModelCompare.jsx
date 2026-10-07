import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
} from 'recharts';
import {
  Target, Award, BarChart2, Zap, Clock, Cpu, Brain, CheckCircle2,
  ArrowRight, TrendingUp, AlertTriangle, Shield
} from 'lucide-react';

// ── Model Data ──────────────────────────────────────────────────────────────────
const CNN = {
  name: 'Custom CNN',
  shortName: 'CNN',
  color: '#16a34a',
  lightColor: '#bbf7d0',
  accuracy: 95.63,
  precision: 95.81,
  recall: 95.63,
  f1: 95.70,
  auc: 98.50,
  trainTime: 5060,
  inferTime: 6.55,
  params: 4.2,
  epochs: 30,
  isProduction: true,
};

const VIT = {
  name: 'Vision Transformer',
  shortName: 'ViT',
  color: '#2563eb',
  lightColor: '#bfdbfe',
  accuracy: 94.71,
  precision: 94.77,
  recall: 94.71,
  f1: 94.74,
  auc: 97.10,
  trainTime: 1367,
  inferTime: 3.52,
  params: 86,
  epochs: 30,
  isProduction: false,
};

const RADAR_DATA = [
  { metric: 'Accuracy',  CNN: CNN.accuracy,  ViT: VIT.accuracy  },
  { metric: 'Precision', CNN: CNN.precision, ViT: VIT.precision },
  { metric: 'Recall',    CNN: CNN.recall,    ViT: VIT.recall    },
  { metric: 'F1 Score',  CNN: CNN.f1,        ViT: VIT.f1        },
  { metric: 'AUC',       CNN: CNN.auc,       ViT: VIT.auc       },
];

const BAR_DATA = [
  { name: 'Accuracy',  CNN: CNN.accuracy,  ViT: VIT.accuracy  },
  { name: 'Precision', CNN: CNN.precision, ViT: VIT.precision },
  { name: 'Recall',    CNN: CNN.recall,    ViT: VIT.recall    },
  { name: 'F1 Score',  CNN: CNN.f1,        ViT: VIT.f1        },
];

const TRAIN_CURVE = [
  { epoch: 1,  cnnAcc: 65.2, vitAcc: 68.1, cnnLoss: 0.85, vitLoss: 0.78 },
  { epoch: 5,  cnnAcc: 78.4, vitAcc: 80.9, cnnLoss: 0.48, vitLoss: 0.41 },
  { epoch: 10, cnnAcc: 86.9, vitAcc: 87.4, cnnLoss: 0.32, vitLoss: 0.30 },
  { epoch: 15, cnnAcc: 91.5, vitAcc: 90.8, cnnLoss: 0.22, vitLoss: 0.24 },
  { epoch: 20, cnnAcc: 94.2, vitAcc: 92.9, cnnLoss: 0.15, vitLoss: 0.18 },
  { epoch: 25, cnnAcc: 95.8, vitAcc: 94.1, cnnLoss: 0.11, vitLoss: 0.14 },
  { epoch: 30, cnnAcc: 96.9, vitAcc: 94.7, cnnLoss: 0.08, vitLoss: 0.12 },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#111827',
  border: '1px solid rgba(75,85,99,0.4)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
};

// ── Sub-components ───────────────────────────────────────────────────────────────
function MetricCard({ label, cnn, vit, unit = '%', icon: Icon, winner }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 text-center ${winner === 'cnn' ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-400/50' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          <p className="text-xs text-gray-400 mb-1">CNN {winner === 'cnn' && '🏆'}</p>
          <p className={`text-xl font-extrabold font-heading ${winner === 'cnn' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {cnn}{unit}
          </p>
        </div>
        <div className={`rounded-xl p-3 text-center ${winner === 'vit' ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400/50' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          <p className="text-xs text-gray-400 mb-1">ViT {winner === 'vit' && '🏆'}</p>
          <p className={`text-xl font-extrabold font-heading ${winner === 'vit' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {vit}{unit}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────────
export default function ModelCompare() {
  const [activeTab, setActiveTab] = useState('metrics');

  const tabs = [
    { id: 'metrics',    label: '📊 Metrics',        icon: BarChart2   },
    { id: 'radar',      label: '🕸️ Radar Chart',    icon: Target      },
    { id: 'training',   label: '📈 Training Curves', icon: TrendingUp  },
    { id: 'tradeoffs',  label: '⚖️ Trade-offs',      icon: Shield      },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
            <BarChart2 className="w-4 h-4" /> Model Comparison
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            CNN vs <span className="text-gradient-green">Vision Transformer</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Side-by-side evaluation of both models trained on the PlastiVision waste classification dataset
            across all key performance metrics.
          </p>

          {/* Production badge */}
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> CNN — Production Model
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-semibold">
              <Brain className="w-4 h-4" /> ViT — Evaluated / Research
            </span>
          </div>
        </motion.div>

        {/* ── Quick Summary Cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Accuracy"      cnn={CNN.accuracy}  vit={VIT.accuracy}  winner="cnn" icon={Target}   />
          <MetricCard label="F1 Score"      cnn={CNN.f1}        vit={VIT.f1}        winner="cnn" icon={Award}    />
          <MetricCard label="Inference"     cnn={CNN.inferTime} vit={VIT.inferTime} winner="vit" icon={Zap}      unit=" ms" />
          <MetricCard label="Training Time" cnn={`${(CNN.trainTime/60).toFixed(0)}m`} vit={`${(VIT.trainTime/60).toFixed(0)}m`} winner="vit" icon={Clock} unit="" />
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── METRICS TAB ── */}
        {activeTab === 'metrics' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Bar Chart */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-5 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-500" /> Performance Metrics Comparison
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={BAR_DATA} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis domain={[93, 97]} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, '']} />
                  <Legend formatter={v => <span className="text-xs text-gray-400">{v}</span>} />
                  <Bar dataKey="CNN" fill={CNN.color}  radius={[6,6,0,0]} name="Custom CNN" />
                  <Bar dataKey="ViT" fill={VIT.color}  radius={[6,6,0,0]} name="Vision Transformer" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Full Metrics Table */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white font-heading">Complete Metrics Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      {['Metric', 'Custom CNN 🧠', 'Vision Transformer 🤖', 'Winner'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { metric: 'Accuracy',        cnn: '95.63%', vit: '94.71%', winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'Precision',        cnn: '95.81%', vit: '94.77%', winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'Recall',           cnn: '95.63%', vit: '94.71%', winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'F1 Score',         cnn: '95.70%', vit: '94.74%', winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'AUC-ROC',          cnn: '0.985',  vit: '0.971',  winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'Training Time',    cnn: '5060 s', vit: '1367 s', winner: 'ViT', wc: 'text-blue-600 dark:text-blue-400'  },
                      { metric: 'Inference Time',   cnn: '6.55 ms',vit: '3.52 ms',winner: 'ViT', wc: 'text-blue-600 dark:text-blue-400'  },
                      { metric: 'Parameters',       cnn: '~4.2 M', vit: '~86 M',  winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'Model Size',       cnn: '~5.5 MB',vit: '~330 MB',winner: 'CNN', wc: 'text-green-600 dark:text-green-400' },
                      { metric: 'Production Status',cnn: '✅ Active',vit:'🔬 Evaluated',winner:'CNN',wc:'text-green-600 dark:text-green-400'},
                    ].map((row, i) => (
                      <tr key={i} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/20'} hover:bg-primary-50/20 dark:hover:bg-primary-900/10`}>
                        <td className="px-6 py-3.5 font-medium text-gray-700 dark:text-gray-300">{row.metric}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-800 dark:text-gray-200">{row.cnn}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-800 dark:text-gray-200">{row.vit}</td>
                        <td className={`px-6 py-3.5 font-bold ${row.wc}`}>{row.winner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RADAR TAB ── */}
        {activeTab === 'radar' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8">
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-6 text-center">
              Performance Radar — CNN vs ViT
            </h3>
            <div className="flex justify-center gap-6 mb-6 text-sm">
              <span className="flex items-center gap-2"><span className="w-4 h-1 rounded bg-green-500 inline-block"/> Custom CNN</span>
              <span className="flex items-center gap-2"><span className="w-4 h-1 rounded bg-blue-500 inline-block"/> Vision Transformer</span>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={RADAR_DATA} outerRadius={150}>
                <PolarGrid stroke="rgba(156,163,175,0.3)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[93, 99]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Radar name="Custom CNN" dataKey="CNN" stroke={CNN.color} fill={CNN.color} fillOpacity={0.25} strokeWidth={2.5} />
                <Radar name="ViT"        dataKey="ViT" stroke={VIT.color} fill={VIT.color} fillOpacity={0.20} strokeWidth={2.5} />
                <Legend formatter={v => <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{v}</span>} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, '']} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── TRAINING CURVES TAB ── */}
        {activeTab === 'training' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Validation Accuracy over Epochs</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={TRAIN_CURVE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="epoch" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -3, fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, '']} />
                  <Legend formatter={v => <span className="text-xs text-gray-400">{v}</span>} />
                  <Line type="monotone" dataKey="cnnAcc" stroke={CNN.color} strokeWidth={2.5} dot={false} name="CNN Val Acc" />
                  <Line type="monotone" dataKey="vitAcc" stroke={VIT.color} strokeWidth={2.5} dot={false} name="ViT Val Acc" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Validation Loss over Epochs</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={TRAIN_CURVE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="epoch" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -3, fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend formatter={v => <span className="text-xs text-gray-400">{v}</span>} />
                  <Line type="monotone" dataKey="cnnLoss" stroke={CNN.color} strokeWidth={2.5} dot={false} name="CNN Val Loss" />
                  <Line type="monotone" dataKey="vitLoss" stroke={VIT.color} strokeWidth={2.5} dot={false} name="ViT Val Loss" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ── TRADE-OFFS TAB ── */}
        {activeTab === 'tradeoffs' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Verdict */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/40 shadow-2xl p-8 text-white">
              <h3 className="font-bold text-xl font-heading mb-6 text-center">⚖️ Head-to-Head Verdict</h3>
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { emoji: '🎯', label: 'Best Accuracy', winner: 'Custom CNN', sub: '95.63% — highest on this dataset', color: 'green' },
                  { emoji: '⚡', label: 'Fastest Inference', winner: 'ViT', sub: '3.52 ms — ~1.9× faster than CNN', color: 'blue' },
                  { emoji: '🏆', label: 'Production Choice', winner: 'Custom CNN', sub: 'Lower params, higher accuracy', color: 'purple' },
                ].map(v => (
                  <div key={v.label} className={`text-center p-5 rounded-2xl bg-${v.color}-900/30 border border-${v.color}-700/40`}>
                    <p className="text-3xl mb-2">{v.emoji}</p>
                    <p className={`font-bold text-${v.color}-300 text-sm mb-1`}>{v.label}</p>
                    <p className="text-xl font-extrabold font-heading">{v.winner}</p>
                    <p className={`text-${v.color}-400/80 text-xs mt-1`}>{v.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* When to use each */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white dark:bg-gray-900 border-2 border-green-400/40 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white font-heading">Use Custom CNN when…</h3>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Maximum classification accuracy is needed',
                    'Deploying on edge/mobile devices (small model)',
                    'Dataset is domain-specific (waste images)',
                    'Fast training iteration is needed',
                    'Production reliability is top priority',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-white dark:bg-gray-900 border-2 border-blue-400/40 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white font-heading">Use Vision Transformer when…</h3>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Ultra-fast inference is critical (real-time apps)',
                    'Global context understanding is important',
                    'Training time must be minimised',
                    'Transfer learning from large-scale vision models',
                    'Research / evaluation on transformer attention',
                  ].map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Confusion Matrix Summary */}
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-5 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" /> Confusion Matrix — CNN (Production)
              </h3>
              <div className="overflow-x-auto">
                <table className="text-sm border-collapse mx-auto">
                  <thead>
                    <tr>
                      <th className="p-3" />
                      <th className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Pred: Biodegradable</th>
                      <th className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Pred: Non-Biodegradable</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap pr-4">Act: Biodegradable</td>
                      <td className="h-16 w-32 text-center font-bold text-white text-lg rounded" style={{ backgroundColor: 'rgba(46,125,50,0.85)' }}>2282</td>
                      <td className="h-16 w-32 text-center font-bold text-white text-base rounded" style={{ backgroundColor: 'rgba(198,40,40,0.5)' }}>83</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap pr-4">Act: Non-Biodegradable</td>
                      <td className="h-16 w-32 text-center font-bold text-white text-base rounded" style={{ backgroundColor: 'rgba(198,40,40,0.5)' }}>95</td>
                      <td className="h-16 w-32 text-center font-bold text-white text-lg rounded" style={{ backgroundColor: 'rgba(46,125,50,0.85)' }}>1713</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 text-center mt-3">Rows = Actual &nbsp;|&nbsp; Cols = Predicted</p>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
