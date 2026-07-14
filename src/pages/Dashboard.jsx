import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/StatCard';
import { Camera, Leaf, Package, Recycle, Target, Clock } from 'lucide-react';

const PIE_DATA = [
  { name: 'Biodegradable', value: 38, color: '#2E7D32' },
  { name: 'Non-Biodegradable', value: 62, color: '#C62828' },
];

const BAR_DATA = [
  { name: 'Plastic Bottle', count: 142 },
  { name: 'Banana Peel', count: 98 },
  { name: 'Plastic Bag', count: 87 },
  { name: 'Plastic Cup', count: 74 },
  { name: 'Apple Core', count: 65 },
  { name: 'Eggshell', count: 52 },
  { name: 'Orange Peel', count: 48 },
];

const LINE_DATA = [
  { day: 'Mon', scans: 45 },
  { day: 'Tue', scans: 62 },
  { day: 'Wed', scans: 38 },
  { day: 'Thu', scans: 79 },
  { day: 'Fri', scans: 91 },
  { day: 'Sat', scans: 54 },
  { day: 'Sun', scans: 33 },
];

const AREA_DATA = [
  { day: 'Mon', accuracy: 96.2 },
  { day: 'Tue', accuracy: 97.1 },
  { day: 'Wed', accuracy: 96.8 },
  { day: 'Thu', accuracy: 98.3 },
  { day: 'Fri', accuracy: 98.7 },
  { day: 'Sat', accuracy: 97.9 },
  { day: 'Sun', accuracy: 98.1 },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1a2e1a',
  border: '1px solid rgba(46,125,50,0.3)',
  borderRadius: '12px',
  color: '#fff',
};

// ─── Read live scan history from localStorage ────────────────────────────────
function readStats() {
  try {
    const today = new Date().toDateString();
    const all = JSON.parse(localStorage.getItem('pv_scans') || '[]');
    const todayScans = all.filter(s => s.date === today);
    const bio = todayScans.filter(s => s.category === 'Biodegradable').length;
    const nonBio = todayScans.filter(s => s.category === 'Non-Biodegradable').length;
    const totalToday = todayScans.length;
    const avgConf = totalToday > 0
      ? (todayScans.reduce((sum, s) => sum + parseFloat(s.confidence || 0), 0) / totalToday).toFixed(1)
      : null;
    return { totalToday, bio, nonBio, avgConf };
  } catch (_) {
    return { totalToday: 0, bio: 0, nonBio: 0, avgConf: null };
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState(readStats);

  // Refresh stats whenever the page becomes visible (after a scan)
  useEffect(() => {
    const update = () => setStats(readStats());
    update();
    window.addEventListener('focus', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('focus', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const { totalToday, bio, nonBio, avgConf } = stats;
  const bioLabel = totalToday > 0 ? `${Math.round((bio / totalToday) * 100)}%` : '—';
  const nonBioLabel = totalToday > 0 ? `${Math.round((nonBio / totalToday) * 100)}%` : '—';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-3">
            📊 Analytics
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-2">
            AI <span className="text-gradient-green">Dashboard</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time analytics and performance metrics for PlastiVision AI.</p>
        </motion.div>

        {/* ─── Stats Grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Camera} label="Total Scans Today" value={totalToday > 0 ? String(totalToday) : '0'} sub={totalToday > 0 ? 'live' : 'no scans yet'} color="blue" delay={0} />
          <StatCard icon={Leaf} label="Biodegradable Detected" value={String(bio)} sub={bioLabel} color="green" delay={0.05} />
          <StatCard icon={Package} label="Non-Biodegradable" value={String(nonBio)} sub={nonBioLabel} color="red" delay={0.1} />
          <StatCard icon={Recycle} label="Recycling Recommendations" value={String(nonBio)} sub={nonBioLabel} color="teal" delay={0.15} />
          <StatCard icon={Target} label="Average Confidence" value={avgConf ? `${avgConf}%` : '—'} color="purple" delay={0.2} />
          <StatCard icon={Clock} label="Avg Inference Time" value="~0.3s" color="orange" delay={0.25} />
        </div>

        {/* ─── Charts Row 1 ─── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Biodegradable vs Non-Biodegradable</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} dataKey="value">
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, '']} />
                <Legend formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Most Frequently Detected Objects</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BAR_DATA} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#2E7D32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ─── Charts Row 2 ─── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Daily Scans</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={LINE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="scans" stroke="#1565C0" strokeWidth={3} dot={{ fill: '#1565C0', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-6"
          >
            <h3 className="font-bold text-gray-900 dark:text-white font-heading mb-4">Prediction Accuracy Trend (%)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={AREA_DATA}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis domain={[95, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Accuracy']} />
                <Area type="monotone" dataKey="accuracy" stroke="#2E7D32" strokeWidth={3} fill="url(#accGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
