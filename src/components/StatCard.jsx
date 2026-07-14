import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = 'green', delay = 0 }) {
  const colors = {
    green: { bg: 'from-green-500/10 to-emerald-500/5', icon: 'from-green-500 to-green-700', text: 'text-green-700 dark:text-green-300', border: 'border-green-400/20' },
    blue: { bg: 'from-blue-500/10 to-indigo-500/5', icon: 'from-blue-500 to-blue-700', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-400/20' },
    red: { bg: 'from-red-500/10 to-rose-500/5', icon: 'from-red-500 to-red-700', text: 'text-red-700 dark:text-red-300', border: 'border-red-400/20' },
    purple: { bg: 'from-purple-500/10 to-violet-500/5', icon: 'from-purple-500 to-purple-700', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-400/20' },
    teal: { bg: 'from-teal-500/10 to-cyan-500/5', icon: 'from-teal-500 to-teal-700', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-400/20' },
    orange: { bg: 'from-orange-500/10 to-amber-500/5', icon: 'from-orange-500 to-orange-700', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-400/20' },
  };

  const c = colors[color] || colors.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 p-5 overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sub && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-white/50 dark:bg-gray-800/50 ${c.text}`}>
            {sub}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold font-heading ${c.text} mb-1`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
    </motion.div>
  );
}
