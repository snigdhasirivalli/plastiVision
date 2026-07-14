import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Target, Award, BarChart2, Zap } from 'lucide-react';

const TRAIN_DATA = [
  { epoch: 1, trainAcc: 62, valAcc: 58, trainLoss: 1.42, valLoss: 1.68 },
  { epoch: 5, trainAcc: 74, valAcc: 70, trainLoss: 0.98, valLoss: 1.12 },
  { epoch: 10, trainAcc: 82, valAcc: 78, trainLoss: 0.68, valLoss: 0.82 },
  { epoch: 15, trainAcc: 88, valAcc: 85, trainLoss: 0.45, valLoss: 0.58 },
  { epoch: 20, trainAcc: 92, valAcc: 89, trainLoss: 0.31, valLoss: 0.42 },
  { epoch: 25, trainAcc: 95, valAcc: 92, trainLoss: 0.22, valLoss: 0.30 },
  { epoch: 30, trainAcc: 97, valAcc: 95, trainLoss: 0.16, valLoss: 0.22 },
  { epoch: 35, trainAcc: 98, valAcc: 97, trainLoss: 0.12, valLoss: 0.17 },
  { epoch: 40, trainAcc: 98.5, valAcc: 97.8, trainLoss: 0.09, valLoss: 0.14 },
];

const HYPERPARAMS = [
  { param: 'Model Name', value: 'MobileNetV2 (Fine-tuned)' },
  { param: 'Image Size', value: '224 × 224' },
  { param: 'Optimizer', value: 'Adam' },
  { param: 'Learning Rate', value: '0.0001' },
  { param: 'Batch Size', value: '32' },
  { param: 'Epochs', value: '40' },
  { param: 'Dropout', value: '0.3' },
  { param: 'Loss Function', value: 'Categorical Crossentropy' },
];

const METRICS = [
  { label: 'Accuracy', value: '98.43%', icon: Target, color: 'from-green-500 to-green-700' },
  { label: 'Precision', value: '97.89%', icon: Award, color: 'from-blue-500 to-blue-700' },
  { label: 'Recall', value: '97.12%', icon: BarChart2, color: 'from-purple-500 to-purple-700' },
  { label: 'F1 Score', value: '97.50%', icon: Zap, color: 'from-amber-500 to-orange-600' },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2e1a',
  border: '1px solid rgba(46,125,50,0.3)',
  borderRadius: '12px',
  color: '#fff',
};

const CONFUSION_MATRIX_CLASSES = ['Ban.Peel', 'Org.Peel', 'Apple', 'TeaBag', 'Egg', 'Pl.Bottle', 'Pl.Wrap', 'Pl.Cup', 'Pl.Cont', 'Pl.Bag'];
const MATRIX = [
  [32,0,0,0,0,0,0,0,0,0],[0,30,1,0,0,0,0,0,0,0],[0,1,31,0,0,0,0,0,0,0],[0,0,0,29,1,0,0,0,0,0],
  [0,0,0,0,31,0,0,0,0,0],[0,0,0,0,0,33,0,0,0,1],[0,0,0,0,0,0,30,1,0,0],[0,0,0,0,0,0,0,31,0,0],
  [0,0,0,0,0,1,0,0,30,0],[0,0,0,0,0,0,0,0,0,32],
];

export default function ModelPerformance() {
  const maxVal = 33;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
            🧠 Model Performance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            Model <span className="text-gradient-green">Evaluation Metrics</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Deep dive into the performance of PlastiVision AI's waste classification model.
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6 text-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <m.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white mb-1">{m.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Accuracy + Loss Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Training vs Validation Accuracy</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={TRAIN_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -3, fill: '#9ca3af', fontSize: 11 }} />
                <YAxis domain={[55, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
                <Legend formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                <Line type="monotone" dataKey="trainAcc" stroke="#2E7D32" strokeWidth={2.5} dot={false} name="Train Acc" />
                <Line type="monotone" dataKey="valAcc" stroke="#1565C0" strokeWidth={2.5} dot={false} name="Val Acc" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Training vs Validation Loss</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TRAIN_DATA}>
                <defs>
                  <linearGradient id="tl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="vl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                <Area type="monotone" dataKey="trainLoss" stroke="#2E7D32" fill="url(#tl)" strokeWidth={2} name="Train Loss" />
                <Area type="monotone" dataKey="valLoss" stroke="#1565C0" fill="url(#vl)" strokeWidth={2} name="Val Loss" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Confusion Matrix + Hyperparams */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Confusion Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6 overflow-x-auto"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Confusion Matrix</h3>
            <div className="text-xs text-gray-400 mb-2">Rows = Actual, Cols = Predicted</div>
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="w-12 p-1"></th>
                    {CONFUSION_MATRIX_CLASSES.map(c => (
                      <th key={c} className="p-1 text-gray-500 dark:text-gray-400 font-medium w-10 text-center" style={{ fontSize: '9px' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row, ri) => (
                    <tr key={ri}>
                      <td className="p-1 text-gray-500 dark:text-gray-400 font-medium text-right pr-2" style={{ fontSize: '9px' }}>{CONFUSION_MATRIX_CLASSES[ri]}</td>
                      {row.map((val, ci) => {
                        const intensity = val / maxVal;
                        const bg = ri === ci
                          ? `rgba(46,125,50,${0.3 + intensity * 0.7})`
                          : val > 0 ? `rgba(198,40,40,${0.2 + intensity * 0.6})` : 'transparent';
                        return (
                          <td
                            key={ci}
                            className="w-10 h-8 text-center font-semibold border border-gray-200/30 dark:border-gray-700/30 rounded"
                            style={{ backgroundColor: bg, color: val > 0 ? '#fff' : '#6b7280', fontSize: '10px' }}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Hyperparams Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
              <h3 className="font-bold text-gray-900 dark:text-white font-heading">Hyperparameters</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {HYPERPARAMS.map((h, i) => (
                  <tr key={h.param} className={`${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''} hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors`}>
                    <td className="px-6 py-3.5 text-gray-500 dark:text-gray-400 font-medium text-sm">{h.param}</td>
                    <td className="px-6 py-3.5 text-gray-900 dark:text-white font-semibold text-sm">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* ROC Curve Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8 text-center"
        >
          <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-3">ROC Curve</h3>
          <div className="h-48 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-primary-700 dark:text-primary-300 font-heading mb-1">AUC = 0.997</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Multi-class ROC — Area Under Curve</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>🟢 Macro-average AUC: 0.997</span>
              <span>🔵 Weighted AUC: 0.998</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
