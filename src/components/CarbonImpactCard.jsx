import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Wind, Target, Star } from 'lucide-react';

export default function CarbonImpactCard({ plasticDiverted = 2.8, co2Saved = 5.4, accuracy = 98, greenScore = 92 }) {
  const metrics = [
    { icon: Leaf, label: 'Plastic Diverted', value: `${plasticDiverted} kg`, color: 'text-green-600 dark:text-green-400' },
    { icon: Wind, label: 'CO₂ Saved', value: `${co2Saved} kg`, color: 'text-blue-600 dark:text-blue-400' },
    { icon: Target, label: 'Segregation Accuracy', value: `${accuracy}%`, color: 'text-purple-600 dark:text-purple-400' },
    { icon: Star, label: 'Green Score', value: `${greenScore}%`, color: 'text-yellow-600 dark:text-yellow-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl border border-green-200/50 dark:border-green-800/30 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/40 dark:to-gray-900/60 backdrop-blur-sm shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Carbon Impact</p>
          <p className="text-green-200 text-xs">Environmental contribution</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-3 border border-white/50 dark:border-gray-700/50 text-center"
          >
            <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-1`} />
            <p className={`text-lg font-bold font-heading ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
