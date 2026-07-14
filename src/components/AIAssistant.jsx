import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

export default function AIAssistant({ result }) {
  const messages = result ? [
    { text: `Detected a ${result.object}.`, delay: 0 },
    { text: `This is a ${result.category} waste item.`, delay: 0.3 },
    { text: `Please dispose of it in a ${result.bin}.`, delay: 0.6 },
    { text: result.tip, delay: 0.9 },
  ] : [
    { text: 'Hello! I\'m your PlastiVision AI Assistant.', delay: 0 },
    { text: 'Upload an image or use your camera to scan a waste item.', delay: 0.3 },
    { text: 'I\'ll help you identify it and suggest the correct disposal method.', delay: 0.6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary-200/50 dark:border-primary-700/30 bg-gradient-to-br from-primary-50/80 to-emerald-50/50 dark:from-primary-950/60 dark:to-gray-900/80 backdrop-blur-sm shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">AI Assistant</p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-primary-200 text-xs">Online</span>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-yellow-300 ml-auto animate-pulse-slow" />
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[160px]">
        {messages.map((msg, i) => (
          <motion.div
            key={`${result?.object}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: msg.delay }}
            className="flex items-start gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-primary-700/20 dark:bg-primary-700/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl px-3 py-2 shadow-sm border border-gray-200/50 dark:border-gray-700/50 max-w-xs">
              <p className="text-sm text-gray-700 dark:text-gray-300">{msg.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
