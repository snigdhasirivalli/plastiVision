import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ExternalLink, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const links = {
    Product: [
      { label: 'About', to: '/about' },
      { label: 'Scan Waste', to: '/scan' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Dataset', to: '/dataset' },
    ],
    Developers: [
      { label: 'Documentation', to: '/about' },
      { label: 'Model Performance', to: '/model' },
      { label: 'Dataset Collection', to: '/dataset-collection' },
      { label: 'Contact', to: '/contact' },
    ],
    Legal: [
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Use', to: '/' },
    ],
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 pt-16 pb-8 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-heading">
                <span className="text-primary-400">PlastiVision</span>
                <span className="text-blue-400 ml-1">AI</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
              Classify Today, Sustain Tomorrow.<br />
              AI-powered waste recognition for a sustainable future.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110" title="GitHub">
                <span className="text-sm font-bold">GH</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110" title="LinkedIn">
                <span className="text-sm font-bold">in</span>
              </a>
              <a href="mailto:plastivision@gmail.com"
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-gray-400 hover:text-primary-400 text-sm transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 PlastiVision AI. Supporting{' '}
            <span className="text-primary-400 font-medium">UN SDG 12</span> — Responsible Consumption & Production.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for a sustainable future
          </p>
        </div>
      </div>
    </footer>
  );
}
