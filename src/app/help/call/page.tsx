'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Phone,
  ArrowLeft,
  Clock,
  MessageCircle,
  CheckCircle,
  Globe,
  HelpCircle,
  ExternalLink,
  Calendar,
  Mail
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function CallSupport() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      {/* Interactive Particles covering entire page */}
      <InteractiveParticles />

      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 bg-green-950/50 backdrop-blur-md border-2 border-green-500 rounded-2xl shadow-lg max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/help" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Help</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">MoneyMind AI</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Phone className="w-4 h-4" />
              Call Support
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Get Help via
              <span className="text-gradient"> Phone</span>
            </h1>
            <p className="text-xl text-[var(--muted-text)] max-w-2xl mx-auto">
              Speak directly with our support team for immediate assistance.
            </p>
          </motion.div>

          {/* Phone Numbers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-green-950/50 backdrop-blur-md border-2 border-green-500 rounded-lg p-8 shadow-xl mb-8"
          >
            <div className="text-center mb-8">
              <Phone className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Call Us</h2>
              <p className="text-[var(--muted-text)] mb-6">Available Monday - Friday, 9 AM - 6 PM EST</p>
              <div className="space-y-3">
                <a
                  href="tel:+1-800-MONEYMIND"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 text-lg"
                >
                  <Phone className="w-5 h-5" />
                  1-800-MONEYMIND
                </a>
                <p className="text-sm text-gray-400">Toll-free number (US & Canada)</p>
              </div>
              <div className="space-y-3 mt-6">
                <a
                  href="tel:+1-555-123-4567"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Globe className="w-5 h-5" />
                  +1-555-123-4567
                </a>
                <p className="text-sm text-gray-400">International callers</p>
              </div>
            </div>
          </motion.div>

          {/* Support Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-green-950/50 backdrop-blur-sm border border-green-500 rounded-lg p-6">
              <Calendar className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Business Hours</h3>
              <div className="space-y-2 text-[var(--muted-text)]">
                <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
            <div className="bg-green-950/50 backdrop-blur-sm border border-green-500 rounded-lg p-6">
              <Globe className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Time Zones</h3>
              <div className="space-y-2 text-[var(--muted-text)]">
                <p>West Coast: 6:00 AM - 3:00 PM PST</p>
                <p>Central: 8:00 AM - 5:00 PM CST</p>
                <p>East Coast: 9:00 AM - 6:00 PM EST</p>
              </div>
            </div>
          </motion.div>

          {/* What to Prepare */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-green-950/50 backdrop-blur-md border-2 border-green-500 rounded-lg p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Before You Call</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Have Your Account Ready</h3>
                  <p className="text-[var(--muted-text)]">Account email and user ID available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Describe Your Issue</h3>
                  <p className="text-[var(--muted-text)]">Clear explanation of the problem you're experiencing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Note Error Messages</h3>
                  <p className="text-[var(--muted-text)]">Write down any error messages you've seen</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Be at Your Computer</h3>
                  <p className="text-[var(--muted-text)]">Have access to your device and account</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Alternative Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-[var(--muted-text)] mb-4">Prefer to write to us?</p>
            <Link
              href="/help/email"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Mail className="w-5 h-5" />
              Try Email Support
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-16 bg-gradient-to-b from-transparent to-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            >
              <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">MoneyMind AI</span>
              </Link>
              <p className="mt-4 text-sm text-[var(--muted-text)]">
                Your intelligent financial companion for smarter money management.
              </p>
            </motion.div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <h3 className="text-white font-semibold mb-6">Product</h3>
              <ul className="space-y-4">
                <li><a href="/#features" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="/how-it-works" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">How It Works</a></li>
                <li><a href="/pricing" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="/demo" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Demo</a></li>
                <li><a href="/api" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">API</a></li>
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <h3 className="text-white font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                <li><a href="/about" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="/blog" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Blog</a></li>
                <li><a href="/careers" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Careers</a></li>
                <li><a href="/press" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Press</a></li>
                <li><a href="/contact" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Contact</a></li>
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <h3 className="text-white font-semibold mb-6">Legal</h3>
              <ul className="space-y-4">
                <li><a href="/privacy" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</a></li>
                <li><a href="/terms" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Terms & Conditions</a></li>
                <li><a href="/help" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
                <li><a href="/cookies" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Cookie Policy</a></li>
                <li><a href="/gdpr" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">GDPR</a></li>
              </ul>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="border-t border-[var(--glass-border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p className="text-[var(--muted-text)] text-sm">
              © 2026 MoneyMind AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-[var(--muted-text)]">Made with care for your financial future.</span>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-300">Privacy</a>
                <a href="/terms" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-300">Terms</a>
                <a href="/cookies" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
