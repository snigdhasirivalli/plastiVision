import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, color = 'green', delay = 0 }) {
  const colorMap = {
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-400/40',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40',
    teal: 'from-teal-500/10 to-teal-600/5 border-teal-500/20 hover:border-teal-400/40',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-400/40',
  };

  const iconColorMap = {
    green: 'from-green-500 to-green-700 shadow-green-500/30',
    blue: 'from-blue-500 to-blue-700 shadow-blue-500/30',
    teal: 'from-teal-500 to-teal-700 shadow-teal-500/30',
    purple: 'from-purple-500 to-purple-700 shadow-purple-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl border bg-gradient-to-br p-6 ${colorMap[color]} backdrop-blur-sm bg-white/60 dark:bg-gray-900/60 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden`}
    >
      {/* Decorative bg circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{ background: color === 'green' ? '#2E7D32' : color === 'blue' ? '#1565C0' : color === 'teal' ? '#00796B' : '#7B1FA2' }}
      />

      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconColorMap[color]} shadow-lg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
