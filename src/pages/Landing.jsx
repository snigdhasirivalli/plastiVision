import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Upload, Zap, Tags, Recycle, Cpu } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import HowItWorks from '../components/HowItWorks';

const RECENT_SCANS = [
  { object: 'Plastic Bottle', bin: 'Recycle Bin', confidence: 98, category: 'Non-Biodegradable', emoji: '🍶' },
  { object: 'Banana Peel', bin: 'Compost Bin', confidence: 97, category: 'Biodegradable', emoji: '🍌' },
  { object: 'Plastic Wrapper', bin: 'Dry Waste Bin', confidence: 96, category: 'Non-Biodegradable', emoji: '🛍️' },
  { object: 'Plastic Cup', bin: 'Recycle Bin', confidence: 95, category: 'Non-Biodegradable', emoji: '🥤' },
];

const BIN_BADGE = {
  'Recycle Bin': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Compost Bin': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Dry Waste Bin': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function Landing() {
  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="hero-bg min-h-screen flex items-center relative pt-16 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '50px 50px' }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/40 border border-primary-600/40 text-primary-300 text-sm font-semibold mb-6"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              Powered by Deep Learning
            </motion.div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold font-heading text-white leading-tight mb-6">
              AI-Powered{' '}
              <span className="text-gradient-green">Smart Waste</span>{' '}
              Recognition
            </h1>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Upload an image or scan using your camera to instantly recognize waste,
              classify it into <span className="text-green-400 font-semibold">biodegradable</span> or{' '}
              <span className="text-red-400 font-semibold">non-biodegradable</span> categories, and receive
              the correct disposal recommendation.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/scan" className="btn-primary text-base px-7 py-3.5">
                <Camera className="w-5 h-5" /> Open Camera
              </Link>
              <Link to="/scan" className="btn-secondary text-base px-7 py-3.5">
                <Upload className="w-5 h-5" /> Upload Image
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { val: '10', label: 'Waste Classes' },
                { val: '98%', label: 'Accuracy' },
                { val: '<1s', label: 'Inference Time' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-primary-300 font-heading">{s.val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — eco AI illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              {/* Center orb */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 rounded-full border-2 border-dashed border-primary-500/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-dashed border-blue-500/20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-36 h-36 rounded-3xl bg-gradient-to-br from-primary-600/80 to-primary-900/80 border border-primary-400/30 backdrop-blur-sm flex flex-col items-center justify-center shadow-2xl glow-green"
                >
                  <Cpu className="w-12 h-12 text-primary-200 mb-2" />
                  <span className="text-white font-bold text-sm">PlastiVision</span>
                  <span className="text-primary-300 text-xs">AI Engine</span>
                </motion.div>
              </div>

              {/* Orbiting icons */}
              {[
                { emoji: '♻️', label: 'Recycle', angle: 0 },
                { emoji: '🍃', label: 'Eco', angle: 60 },
                { emoji: '🧴', label: 'Plastic', angle: 120 },
                { emoji: '🌱', label: 'Green', angle: 180 },
                { emoji: '🔬', label: 'CV', angle: 240 },
                { emoji: '🤖', label: 'AI', angle: 300 },
              ].map((item, i) => {
                const rad = (item.angle * Math.PI) / 180;
                const r = 140;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    whileHover={{ scale: 1.2 }}
                    className="absolute w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex flex-col items-center justify-center cursor-default shadow-lg"
                    style={{
                      left: `calc(50% + ${x}px - 28px)`,
                      top: `calc(50% + ${y}px - 28px)`,
                    }}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-white/60 text-xs">{item.label}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Slogan badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-primary-700 to-primary-900 border border-primary-500/30 shadow-xl whitespace-nowrap"
            >
              <p className="text-white text-xs font-semibold">
                "Classify Today, Sustain Tomorrow."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
              ✨ Features
            </span>
            <h2 className="section-heading">Everything You Need for Smart Waste Management</h2>
            <p className="section-subheading">
              PlastiVision AI combines computer vision, deep learning, and sustainability insights in one platform.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Zap} title="Real-Time Detection" description="Instant AI-powered waste recognition using an optimized deep learning model running at near-zero latency." color="blue" delay={0} />
            <FeatureCard icon={Tags} title="Waste Classification" description="Recognizes waste objects and determines whether they are biodegradable or non-biodegradable with high accuracy." color="green" delay={0.1} />
            <FeatureCard icon={Recycle} title="Smart Disposal Recommendation" description="Suggests the correct disposal method such as Recycle Bin, Compost Bin, or Dry Waste Bin." color="teal" delay={0.2} />
            <FeatureCard icon={Cpu} title="Low-Cost AI Solution" description="Optimized lightweight deep learning model designed for real-time performance on standard hardware." color="purple" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <HowItWorks />

      {/* ─── RECENT SCANS ─── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4">
              🕑 Recent Scans
            </span>
            <h2 className="section-heading">Latest AI Predictions</h2>
            <p className="section-subheading">Recent waste items detected and classified by PlastiVision AI.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RECENT_SCANS.map((scan, i) => (
              <motion.div
                key={scan.object}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 p-5"
              >
                <div className="text-4xl mb-3">{scan.emoji}</div>
                <h4 className="font-bold text-gray-900 dark:text-white font-heading mb-1">{scan.object}</h4>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BIN_BADGE[scan.bin]}`}>
                    {scan.bin}
                  </span>
                  <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{scan.confidence}%</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                    style={{ width: `${scan.confidence}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/scan" className="btn-primary px-8 py-3.5 text-base">
              <Camera className="w-5 h-5" /> Start Scanning Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary-800 via-primary-700 to-blue-800 p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading mb-4 relative z-10">
              Ready to Make an Environmental Impact?
            </h2>
            <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto relative z-10">
              Join PlastiVision AI and contribute to responsible waste management powered by artificial intelligence.
            </p>
            <Link to="/scan" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary-800 font-bold text-base hover:bg-primary-50 transition-all duration-200 hover:scale-105 shadow-xl">
              <Camera className="w-5 h-5" /> Scan Waste Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
