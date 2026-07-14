import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Target, Eye, Leaf, Recycle, Cpu, Users, BookOpen } from 'lucide-react';

const OBJECTIVES = [
  'Automate waste identification using deep learning to reduce human error in waste segregation.',
  'Classify waste as biodegradable or non-biodegradable in real time with high accuracy.',
  'Recommend the correct disposal bin to promote proper waste management.',
  'Raise environmental awareness by providing tips on sustainable disposal practices.',
  'Demonstrate a low-cost, deployable AI solution suitable for public use.',
];

const AI_BENEFITS = [
  { icon: Cpu, title: 'Automated Recognition', desc: 'AI eliminates manual sorting errors through consistent, unbiased object detection.' },
  { icon: Target, title: 'High Precision', desc: '98%+ accuracy ensures waste is correctly classified every time, reducing contamination.' },
  { icon: Recycle, title: 'Promotes Recycling', desc: 'Smart bin recommendations increase recycling rates and reduce landfill burden.' },
  { icon: Globe, title: 'Scalable Solution', desc: 'Deployable on mobile devices and kiosks — bringing AI-powered recycling everywhere.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
            🌿 About
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            About <span className="text-gradient-green">PlastiVision AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base">
            A deep learning-powered waste recognition system designed to support responsible consumption and environmental sustainability.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {[
            {
              icon: Eye,
              title: 'Our Mission',
              color: 'from-primary-700 to-primary-900',
              body: 'To leverage artificial intelligence and computer vision to make waste segregation simpler, smarter, and more accessible — empowering individuals and communities to adopt responsible waste management habits and contribute meaningfully to environmental sustainability.',
            },
            {
              icon: Globe,
              title: 'Our Vision',
              color: 'from-blue-700 to-blue-900',
              body: 'A world where every piece of waste is correctly sorted, reducing pollution and conserving natural resources. PlastiVision AI aims to be a catalyst for clean, AI-powered communities where technology bridges the gap between awareness and action in waste management.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <div className={`bg-gradient-to-r ${item.color} p-5 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-white font-bold text-lg font-heading">{item.title}</h2>
              </div>
              <div className="bg-white/80 dark:bg-gray-900/70 p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-8 mb-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">Objectives</h2>
          </div>
          <ul className="space-y-3">
            {OBJECTIVES.map((obj, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{obj}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* SDG 12 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-xl mb-10"
        >
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-4xl">🌍</span>
            </div>
            <div>
              <p className="text-amber-100 text-sm font-semibold uppercase tracking-wider mb-1">United Nations SDG</p>
              <h3 className="text-white text-2xl font-extrabold font-heading mb-1">SDG 12 — Responsible Consumption & Production</h3>
              <p className="text-amber-100 text-sm leading-relaxed max-w-2xl">
                PlastiVision AI directly supports UN Sustainable Development Goal 12 by enabling proper waste classification and disposal. Through AI-powered waste segregation, the system promotes sustainable consumption patterns, reduces landfill pressure, and encourages recycling — key pillars of SDG 12.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How AI Helps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6 text-center">
            How AI Improves Waste Segregation
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AI_BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg p-5 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3">
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white font-heading mb-2">{b.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
