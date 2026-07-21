import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import StatCard from '../components/StatCard';
import { Camera, Leaf, Package, Recycle, Target, Clock } from 'lucide-react';

import { fetchDashboardData } from '../services/api';

const PIE_DATA = [
  { name: 'Biodegradable', value: 50, color: '#2E7D32' },
  { name: 'Non-Biodegradable', value: 50, color: '#C62828' },
];

const BAR_DATA = [];
const LINE_DATA = [];
const AREA_DATA = [];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1a2e1a',
  border: '1px solid rgba(46,125,50,0.3)',
  borderRadius: '12px',
  color: '#fff',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ totalToday: 0, bio: 0, nonBio: 0, avgConf: null, avgTime: '~0.3s' });
  const [pieData, setPieData] = useState(PIE_DATA);
  const [barData, setBarData] = useState(BAR_DATA);
  const [lineData, setLineData] = useState(LINE_DATA);
  const [areaData, setAreaData] = useState(AREA_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setStats({
          totalToday: data.total_scans,
          bio: data.biodegradable_count,
          nonBio: data.non_biodegradable_count,
          avgConf: data.average_confidence,
          avgTime: data.average_prediction_time_ms ? `${data.average_prediction_time_ms} ms` : '—'
        });
        if (data.pie_data) setPieData(data.pie_data);
        if (data.bar_data) setBarData(data.bar_data);
        if (data.line_data) setLineData(data.line_data);
        if (data.area_data) setAreaData(data.area_data);
      } catch (err) {
        console.error('[Dashboard] Error fetching analytics:', err);
        setError(err.message || 'Failed to load live backend analytics.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const { totalToday, bio, nonBio, avgConf, avgTime } = stats;
  const bioLabel = totalToday > 0 ? `${Math.round((bio / totalToday) * 100)}%` : '—';
  const nonBioLabel = totalToday > 0 ? `${Math.round((nonBio / totalToday) * 100)}%` : '—';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading live analytics...</p>
        </div>
      </div>
    );
  }

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
          <StatCard icon={Clock} label="Avg Inference Time" value={avgTime} color="orange" delay={0.25} />
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
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
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
              <BarChart data={barData} margin={{ left: -20, right: 10 }}>
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
              <LineChart data={lineData}>
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
              <AreaChart data={areaData}>
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
