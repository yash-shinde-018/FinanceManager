'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Wallet,
  PieChart,
  Bell,
  Target,
  Zap,
  BarChart3,
  Lock,
  ArrowLeft,
  Database,
  Eye,
  UserCheck,
  Globe,
  HelpCircle,
  Calendar,
  Trash2
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 card-glass border border-[var(--glass-border)] rounded-2xl shadow-lg max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">MoneyMind AI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Features</a>
              <a href="/how-it-works" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">How It Works</a>
              <a href="#pricing" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-secondary hidden sm:block">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Interactive Particles covering entire page */}
      <InteractiveParticles />

      {/* Main Content */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 hover:bg-purple-500/20 transition-colors duration-300">
              <Shield className="w-4 h-4" />
              Privacy Policy
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Your Privacy
              <span className="text-gradient"> Matters</span>
            </h1>
            <p className="text-xl text-[var(--muted-text)] max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Privacy Content */}
          <div className="space-y-8">
            {/* Data Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="border border-purple-400/30 rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-6 h-6 text-purple-400" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>We collect information to provide better services to our users. This includes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Account information (email, name, password)</li>
                  <li>Financial data (transactions, accounts, spending patterns)</li>
                  <li>Usage data (features used, time spent, device information)</li>
                  <li>Communication data (support tickets, feedback)</li>
                  <li>Technical data (IP address, browser type, device identifiers)</li>
                </ul>
              </div>
            </motion.div>

            {/* Data Usage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-400" />
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain our financial management services</li>
                  <li>Generate personalized insights and recommendations</li>
                  <li>Improve our services through analytics and feedback</li>
                  <li>Communicate with you about your account</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </motion.div>

            {/* Data Protection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-purple-400" />
                Data Security & Protection
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>256-bit SSL encryption for all data transmissions</li>
                  <li>Encrypted storage of sensitive information</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Two-factor authentication for account protection</li>
                  <li>Secure data centers with 24/7 monitoring</li>
                  <li>Employee access controls and training</li>
                </ul>
              </div>
            </motion.div>

            {/* User Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-purple-400" />
                Your Rights & Choices
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Export your data in a portable format</li>
                  <li>Restrict processing of your information</li>
                </ul>
              </div>
            </motion.div>

            {/* Third Parties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-purple-400" />
                Third-Party Services
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>We may share information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Financial institutions for transaction processing</li>
                  <li>Cloud service providers for data storage</li>
                  <li>Analytics providers for service improvement</li>
                  <li>Legal authorities when required by law</li>
                </ul>
                <p>We never sell your personal information to third parties for marketing purposes.</p>
              </div>
            </motion.div>

            {/* Data Retention */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                Data Retention
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>We retain your information only as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Fulfill legitimate business interests</li>
                </ul>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: "#a855f7"
              }}
              className="rounded-xl p-8 bg-gradient-to-br from-purple-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>If you have questions about this Privacy Policy, please contact us:</p>
                <div className="space-y-2">
                  <p>Email: privacy@moneymind.ai</p>
                  <p>Phone: 1-800-MONEYMIND</p>
                  <p>Address: 123 AI Street, Tech City, TC 12345</p>
                </div>
              </div>
            </motion.div>
          </div>
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
                  <Shield className="w-6 h-6 text-white" />
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
