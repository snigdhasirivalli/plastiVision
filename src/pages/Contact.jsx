import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ExternalLink, GraduationCap } from 'lucide-react';

const TEAM = [
  {
    name: 'Snigdha Siri Valli',
    role: 'ML Engineer & Lead Developer',
    emoji: '👩‍💻',
    email: 'snigdhasirivalli2205@gmail.com',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    contribution: 'Model training, dataset collection, web integration',
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
            👥 Team
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mb-3">
            Meet the <span className="text-gradient-green">Team</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            PlastiVision AI is built by a passionate team of AI & ML engineering students from Amrita School of Engineering.
          </p>
        </motion.div>

        {/* College Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-primary-700 to-primary-900 p-6 flex flex-col sm:flex-row items-center gap-5 mb-10 shadow-xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-primary-200 text-sm font-semibold uppercase tracking-wider mb-1">Institution</p>
            <h2 className="text-white text-xl font-bold font-heading">Amrita School of Engineering</h2>
            <p className="text-primary-200 text-sm">Department of Artificial Intelligence & Machine Learning • 7th Semester Project, 2025</p>
          </div>
        </motion.div>



        {/* Team Cards */}
        <div className="flex justify-center">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-6 text-center">
                <div className="text-5xl mb-3">{member.emoji}</div>
                <h3 className="text-white font-bold text-lg font-heading">{member.name}</h3>
                <p className="text-primary-200 text-sm">{member.role}</p>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contribution</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">{member.contribution}</p>
                <div className="flex gap-3 justify-center">
                  <a href={`mailto:${member.email}`}
                    className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors hover:scale-110 duration-200">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href={member.github} target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors hover:scale-110 duration-200" title="GitHub">
                    <span className="text-xs font-bold">GH</span>
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors hover:scale-110 duration-200" title="LinkedIn">
                    <span className="text-xs font-bold">in</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-center shadow-xl"
        >
          <h3 className="text-white font-bold text-xl font-heading mb-2">Get In Touch</h3>
          <p className="text-blue-200 text-sm mb-5">Have questions about PlastiVision AI? We'd love to hear from you.</p>
          <a href="mailto:snigdhasirivalli2205@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-800 font-semibold text-sm hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-lg">
            <Mail className="w-4 h-4" /> snigdhasirivalli2205@gmail.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}
