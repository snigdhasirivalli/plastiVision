import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Target, Award, BarChart2, Zap, CheckCircle2, Clock } from 'lucide-react';
import { fetchModelPerformance } from '../services/api';

// ── Static fallbacks (shown until API responds) ───────────────────────────────
const DEFAULT_METRICS = [
  { label: 'Accuracy',  value: '95.63%', icon: Target,    color: 'from-green-500 to-green-700' },
  { label: 'Precision', value: '95.81%', icon: Award,     color: 'from-blue-500 to-blue-700'  },
  { label: 'Recall',    value: '95.63%', icon: BarChart2, color: 'from-purple-500 to-purple-700' },
  { label: 'F1 Score',  value: '95.70%', icon: Zap,       color: 'from-amber-500 to-orange-600' },
];

const DEFAULT_HYPERPARAMS = [
  { param: 'Model Name',    value: 'Custom CNN' },
  { param: 'Image Size',    value: '224 × 224'  },
  { param: 'Optimizer',     value: 'Adam'       },
  { param: 'Learning Rate', value: '0.001'      },
  { param: 'Batch Size',    value: '32'         },
  { param: 'Epochs',        value: '30'         },
  { param: 'Dropout',       value: '0.5'        },
  { param: 'Loss Function', value: 'Sparse Categorical Crossentropy' },
  { param: 'Classes',       value: '2'          },
  { param: 'Training Time', value: '5060.08 s'  },
];

const DEFAULT_TRAIN_DATA = [
  { epoch:  1, trainAcc: 65.2, valAcc: 62.4, trainLoss: 0.85, valLoss: 0.92 },
  { epoch:  5, trainAcc: 78.4, valAcc: 75.1, trainLoss: 0.48, valLoss: 0.53 },
  { epoch: 10, trainAcc: 86.9, valAcc: 84.3, trainLoss: 0.32, valLoss: 0.38 },
  { epoch: 15, trainAcc: 91.5, valAcc: 89.8, trainLoss: 0.22, valLoss: 0.28 },
  { epoch: 20, trainAcc: 94.2, valAcc: 92.7, trainLoss: 0.15, valLoss: 0.20 },
  { epoch: 25, trainAcc: 95.8, valAcc: 94.6, trainLoss: 0.11, valLoss: 0.15 },
  { epoch: 30, trainAcc: 96.9, valAcc: 95.6, trainLoss: 0.08, valLoss: 0.12 },
];

const DEFAULT_CLASSES   = ['Biodegradable', 'Non_Biodegradable'];
const DEFAULT_MATRIX    = [[2282, 83], [95, 1713]];
const DEFAULT_COMPARISON = [
  {
    model: 'Custom CNN', accuracy: '95.63%', precision: '95.81%',
    recall: '95.63%', f1_score: '95.70%',
    training_time: '5060.08 s', prediction_time: '6.55 ms', is_production: true,
  },
  {
    model: 'Vision Transformer (ViT)', accuracy: '94.71%', precision: '94.77%',
    recall: '94.71%', f1_score: '94.74%',
    training_time: '1367.32 s', prediction_time: '3.52 ms', is_production: false,
  },
];

const TOOLTIP_STYLE = {
  backgroundColor: '#1a2e1a',
  border: '1px solid rgba(46,125,50,0.3)',
  borderRadius: '12px',
  color: '#fff',
};

export default function ModelPerformance() {
  const [metrics,     setMetrics]     = useState(DEFAULT_METRICS);
  const [hyperparams, setHyperparams] = useState(DEFAULT_HYPERPARAMS);
  const [trainData,   setTrainData]   = useState(DEFAULT_TRAIN_DATA);
  const [matrix,      setMatrix]      = useState(DEFAULT_MATRIX);
  const [classesList, setClassesList] = useState(DEFAULT_CLASSES);
  const [aucValue,    setAucValue]    = useState(0.985);
  const [comparison,  setComparison]  = useState(DEFAULT_COMPARISON);
  const [loading,     setLoading]     = useState(true);
  const [backendOk,   setBackendOk]   = useState(true);

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        setLoading(true);
        const data = await fetchModelPerformance();
        setBackendOk(true);
        setMetrics([
          { label: 'Accuracy',  value: data.accuracy,  icon: Target,    color: 'from-green-500 to-green-700'   },
          { label: 'Precision', value: data.precision, icon: Award,     color: 'from-blue-500 to-blue-700'    },
          { label: 'Recall',    value: data.recall,    icon: BarChart2, color: 'from-purple-500 to-purple-700' },
          { label: 'F1 Score',  value: data.f1_score,  icon: Zap,       color: 'from-amber-500 to-orange-600'  },
        ]);
        if (data.hyperparameters)        setHyperparams(data.hyperparameters);
        if (data.train_data)             setTrainData(data.train_data);
        if (data.matrix)                 setMatrix(data.matrix);
        if (data.auc)                    setAucValue(data.auc);
        if (data.confusion_matrix_classes) setClassesList(data.confusion_matrix_classes);
        if (data.comparison)             setComparison(data.comparison);
      } catch (err) {
        // Backend offline — keep static defaults, show notice
        console.error('[ModelPerformance] Backend unavailable, using cached metrics:', err.message);
        setBackendOk(false);
      } finally {
        setLoading(false);
      }
    };
    loadPerformance();
  }, []);

  const maxVal = matrix.length > 0
    ? Math.max(...matrix.map(row => Math.max(...row)))
    : 2282;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading model evaluation metrics...</p>
        </div>
      </div>
    );
  }

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
            Deep dive into the performance of PlastiVision AI's waste classification models.
          </p>
          {!backendOk && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
              ⚠️ Backend Offline — showing last known metrics
            </div>
          )}
        </motion.div>

        {/* Production Model Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 font-semibold text-sm shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            Production Model: Custom CNN — Accuracy 95.63%
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metrics.map((m, i) => (
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

        {/* Model Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
            <h3 className="font-bold text-gray-900 dark:text-white font-heading">Model Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 dark:bg-gray-800/50">
                <tr>
                  {['Model', 'Accuracy', 'Precision', 'Recall', 'F1 Score', 'Training Time', 'Prediction Time', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {comparison.map((row, i) => (
                  <tr key={i} className={`${row.is_production ? 'bg-green-50/40 dark:bg-green-900/10' : ''} hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{row.model}</td>
                    <td className="px-5 py-3.5 text-green-700 dark:text-green-300 font-bold">{row.accuracy}</td>
                    <td className="px-5 py-3.5 text-blue-700 dark:text-blue-300 font-semibold">{row.precision}</td>
                    <td className="px-5 py-3.5 text-purple-700 dark:text-purple-300 font-semibold">{row.recall}</td>
                    <td className="px-5 py-3.5 text-amber-700 dark:text-amber-300 font-semibold">{row.f1_score}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 text-xs">{row.training_time}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 text-xs">{row.prediction_time}</td>
                    <td className="px-5 py-3.5">
                      {row.is_production ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Production
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs font-semibold">
                          Evaluated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Training Accuracy + Loss Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Training vs Validation Accuracy</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Epoch', position: 'insideBottom', offset: -3, fill: '#9ca3af', fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
                <Legend formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                <Line type="monotone" dataKey="trainAcc" stroke="#2E7D32" strokeWidth={2.5} dot={false} name="Train Acc" />
                <Line type="monotone" dataKey="valAcc"   stroke="#1565C0" strokeWidth={2.5} dot={false} name="Val Acc" strokeDasharray="5 5" />
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
              <AreaChart data={trainData}>
                <defs>
                  <linearGradient id="tl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2E7D32" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="vl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1565C0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                <Area type="monotone" dataKey="trainLoss" stroke="#2E7D32" fill="url(#tl)" strokeWidth={2} name="Train Loss" />
                <Area type="monotone" dataKey="valLoss"   stroke="#1565C0" fill="url(#vl)" strokeWidth={2} name="Val Loss"   />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Confusion Matrix + Hyperparams */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Confusion Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-2">Confusion Matrix</h3>
            <p className="text-xs text-gray-400 mb-5">Rows = Actual &nbsp;|&nbsp; Cols = Predicted</p>
            <div className="overflow-x-auto">
              <table className="text-sm border-collapse w-full">
                <thead>
                  <tr>
                    <th className="p-2" />
                    {classesList.map(c => (
                      <th key={c} className="p-2 text-gray-500 dark:text-gray-400 font-semibold text-xs text-center whitespace-nowrap">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, ri) => (
                    <tr key={ri}>
                      <td className="p-2 text-gray-500 dark:text-gray-400 font-semibold text-xs text-right pr-4 whitespace-nowrap">{classesList[ri]}</td>
                      {row.map((val, ci) => {
                        const intensity = val / maxVal;
                        const bg = ri === ci
                          ? `rgba(46,125,50,${0.25 + intensity * 0.7})`
                          : val > 0 ? `rgba(198,40,40,${0.2 + intensity * 0.6})` : 'transparent';
                        return (
                          <td
                            key={ci}
                            className="h-16 text-center font-bold border border-gray-200/30 dark:border-gray-700/30 rounded text-base"
                            style={{ backgroundColor: bg, color: val > 0 ? '#fff' : '#6b7280', minWidth: '80px' }}
                          >
                            {val.toLocaleString()}
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
                {hyperparams.map((h, i) => (
                  <tr key={h.param} className={`${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''} hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors`}>
                    <td className="px-6 py-3.5 text-gray-500 dark:text-gray-400 font-medium text-sm">{h.param}</td>
                    <td className="px-6 py-3.5 text-gray-900 dark:text-white font-semibold text-sm">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* ROC AUC */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8 text-center"
        >
          <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-3">ROC Curve</h3>
          <div className="h-48 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/10 dark:to-blue-900/10 rounded-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-primary-700 dark:text-primary-300 font-heading mb-1">
              AUC = {aucValue}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Binary Classification ROC — Area Under Curve</p>
            <div className="mt-4 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span>🟢 Custom CNN AUC: {aucValue}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Prediction Time: 6.55 ms</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
