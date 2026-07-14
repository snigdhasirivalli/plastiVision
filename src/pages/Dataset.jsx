import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Database, Image, BookOpen, CheckCircle2 } from 'lucide-react';

const CLASSES = [
  { name: 'Banana Peel', type: 'Bio', count: 320, color: '#FFD54F' },
  { name: 'Orange Peel', type: 'Bio', count: 298, color: '#FF9800' },
  { name: 'Apple Core', type: 'Bio', count: 285, color: '#EF5350' },
  { name: 'Tea Bag', type: 'Bio', count: 264, color: '#8D6E63' },
  { name: 'Eggshell', type: 'Bio', count: 271, color: '#E8F5E9' },
  { name: 'Plastic Bottle', type: 'Non-Bio', count: 342, color: '#1565C0' },
  { name: 'Plastic Wrapper', type: 'Non-Bio', count: 318, color: '#7986CB' },
  { name: 'Plastic Cup', type: 'Non-Bio', count: 305, color: '#26C6DA' },
  { name: 'Plastic Container', type: 'Non-Bio', count: 289, color: '#AB47BC' },
  { name: 'Plastic Bag', type: 'Non-Bio', count: 308, color: '#EC407A' },
];

const INFO_CARDS = [
  { label: 'Dataset Name', value: 'PlastiVision Waste Dataset', icon: Database, color: 'green' },
  { label: 'Total Classes', value: '10', icon: BookOpen, color: 'blue' },
  { label: 'Total Images', value: '3,000 (est.)', icon: Image, color: 'purple' },
  { label: 'Self-Collected', value: '~1,500', icon: CheckCircle2, color: 'teal' },
  { label: 'Public Dataset', value: '~1,500', icon: Database, color: 'orange' },
  { label: 'Training Images', value: '2,400', icon: Image, color: 'green' },
  { label: 'Validation Images', value: '300', icon: Image, color: 'blue' },
  { label: 'Testing Images', value: '300', icon: Image, color: 'red' },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1a2e1a',
  border: '1px solid rgba(46,125,50,0.3)',
  borderRadius: '12px',
  color: '#fff',
};

const COLOR_MAP = {
  green: 'from-green-500/10 to-emerald-500/5 border-green-400/20 text-green-700 dark:text-green-300',
  blue: 'from-blue-500/10 to-indigo-500/5 border-blue-400/20 text-blue-700 dark:text-blue-300',
  purple: 'from-purple-500/10 to-violet-500/5 border-purple-400/20 text-purple-700 dark:text-purple-300',
  teal: 'from-teal-500/10 to-cyan-500/5 border-teal-400/20 text-teal-700 dark:text-teal-300',
  orange: 'from-orange-500/10 to-amber-500/5 border-orange-400/20 text-orange-700 dark:text-orange-300',
  red: 'from-red-500/10 to-rose-500/5 border-red-400/20 text-red-700 dark:text-red-300',
};

export default function Dataset() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
            🗃️ Dataset
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            PlastiVision <span className="text-gradient-green">Waste Dataset</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            A curated waste image dataset combining self-collected and public images across 10 waste classes.
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {INFO_CARDS.map((card, i) => {
            const c = COLOR_MAP[card.color] || COLOR_MAP.green;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl bg-gradient-to-br ${c} border bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm shadow-md p-5`}
              >
                <card.icon className={`w-6 h-6 mb-3 ${c.split(' ')[3]}`} />
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
                <p className={`text-xl font-bold font-heading ${c.split(' ')[3]}`}>{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Class Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6 mb-8"
        >
          <h3 className="font-bold text-gray-900 dark:text-white font-heading text-xl mb-6">Class Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={CLASSES} margin={{ left: -15, right: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {CLASSES.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Class Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
            <h3 className="font-bold text-gray-900 dark:text-white font-heading">Dataset Classes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Images (est.)</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {CLASSES.map(cls => (
                  <tr key={cls.name} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{cls.name}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cls.type === 'Bio' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {cls.type === 'Bio' ? 'Biodegradable' : 'Non-Biodegradable'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{cls.count}</td>
                    <td className="px-6 py-3 w-48">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(cls.count / 342) * 100}%`, background: cls.color }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
