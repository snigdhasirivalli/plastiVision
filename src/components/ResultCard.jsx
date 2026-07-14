import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Recycle, Leaf, Trash2, Clock, Zap, Info } from 'lucide-react';

const BIN_CONFIG = {
  'Recycle Bin': { color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-600', icon: Recycle },
  'Compost Bin': { color: 'brown', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-600', icon: Leaf },
  'Dry Waste Bin': { color: 'gray', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-300 dark:border-gray-600', icon: Trash2 },
};

const CATEGORY_CONFIG = {
  'Non-Biodegradable': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-300 dark:border-red-600', dot: 'bg-red-500' },
  'Biodegradable': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-600', dot: 'bg-green-500' },
};

export default function ResultCard({ result }) {
  const { object, category, confidence, bin, tip, time } = result;
  const binCfg = BIN_CONFIG[bin] || BIN_CONFIG['Dry Waste Bin'];
  const catCfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Non-Biodegradable'];
  const BinIcon = binCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg font-heading">Analysis Complete</h3>
          <p className="text-primary-200 text-xs">Inference Status: <span className="text-green-300 font-semibold">Success</span></p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-primary-200 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" /> {time}s
          </p>
          <p className="text-white text-xs font-semibold">Prediction Time</p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Key Results */}
        <div className="space-y-3">
          {/* Object */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Detected Object</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white font-heading">{object}</p>
          </div>

          {/* Category */}
          <div className={`rounded-xl p-3 border ${catCfg.bg} ${catCfg.border}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Waste Category</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${catCfg.dot}`} />
              <p className={`text-base font-bold ${catCfg.text}`}>{category}</p>
            </div>
          </div>

          {/* Confidence */}
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Confidence Score</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                />
              </div>
              <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">{confidence}%</span>
            </div>
          </div>
        </div>

        {/* Right: Bin + Tip */}
        <div className="space-y-3">
          {/* Recommended Bin */}
          <div className={`rounded-xl p-4 border ${binCfg.bg} ${binCfg.border}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recommended Bin</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${binCfg.bg} border ${binCfg.border}`}>
                <BinIcon className={`w-5 h-5 ${binCfg.text}`} />
              </div>
              <p className={`text-base font-bold ${binCfg.text}`}>{bin}</p>
            </div>
          </div>

          {/* Environmental Tip */}
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/10 p-4 border border-primary-200/50 dark:border-primary-700/30">
            <div className="flex items-start gap-2 mb-1">
              <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary-700 dark:text-primary-400 uppercase tracking-wider font-semibold">Environmental Tip</p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">"{tip}"</p>
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-2 justify-end">
            <Zap className="w-3 h-3 text-primary-500" />
            <span className="text-xs text-gray-400">Powered by PlastiVision AI</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
