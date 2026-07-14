import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Cpu, Eye, Tags, Trash2, Lightbulb } from 'lucide-react';

const steps = [
  { icon: Camera, label: 'Capture Image', desc: 'Upload or use camera', color: 'from-blue-500 to-blue-700' },
  { icon: Cpu, label: 'AI Detection', desc: 'Deep learning inference', color: 'from-purple-500 to-purple-700' },
  { icon: Eye, label: 'Object Recognition', desc: 'Identify waste item', color: 'from-indigo-500 to-indigo-700' },
  { icon: Tags, label: 'Waste Classification', desc: 'Bio / Non-Bio category', color: 'from-primary-500 to-primary-700' },
  { icon: Trash2, label: 'Disposal Recommendation', desc: 'Correct bin suggestion', color: 'from-teal-500 to-teal-700' },
  { icon: Lightbulb, label: 'Environmental Tip', desc: 'Eco-awareness advice', color: 'from-amber-500 to-orange-600' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
            🔄 How It Works
          </span>
          <h2 className="section-heading">Six Simple Steps to Smart Waste Management</h2>
          <p className="section-subheading">
            Our AI pipeline processes your waste image through six intelligent stages in under a second.
          </p>
        </motion.div>

        {/* Desktop: horizontal flow */}
        <div className="hidden md:flex items-start gap-0 relative">
          {/* Connection line */}
          <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-400 via-primary-400 to-amber-400 opacity-30 z-0" />

          {steps.map((step, i) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 flex flex-col items-center text-center z-10 px-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-4 hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Step {i + 1}</span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white font-heading mb-1">{step.label}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center pt-6 px-1 z-10">
                  <span className="text-primary-400 text-lg font-bold">→</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile: vertical list */}
        <div className="md:hidden space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Step {i + 1}</span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{step.label}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
