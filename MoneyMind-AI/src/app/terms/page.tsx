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
  FileText,
  ArrowLeft,
  CreditCard,
  Users,
  AlertTriangle,
  HelpCircle,
  Scale,
  Gavel
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function TermsConditions() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 hover:bg-indigo-500/20 transition-colors duration-300">
              <FileText className="w-4 h-4" />
              Terms & Conditions
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Terms of
              <span className="text-gradient"> Service</span>
            </h1>
            <p className="text-xl text-[var(--muted-text)] max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          {/* Terms Content */}
          <div className="space-y-8">
            {/* Acceptance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-400" />
                Acceptance of Terms
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>By accessing and using MoneyMind AI, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our service.</p>
                <p>We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
              </div>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-indigo-400" />
                Description of Services
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>MoneyMind AI provides financial management services including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Expense tracking and categorization</li>
                  <li>Budget planning and monitoring</li>
                  <li>Financial insights and analytics</li>
                  <li>AI-powered spending predictions</li>
                  <li>Transaction management and reporting</li>
                  <li>Goal setting and progress tracking</li>
                </ul>
              </div>
            </motion.div>

            {/* User Responsibilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-indigo-400" />
                User Responsibilities
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>As a user, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the service for lawful purposes only</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Not interfere with or disrupt the service</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect the rights of other users</li>
                </ul>
              </div>
            </motion.div>

            {/* Payment Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-indigo-400" />
                Payment Terms
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>For paid services:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All fees are non-refundable unless specified</li>
                  <li>Payments are processed securely through third-party providers</li>
                  <li>Subscription fees are billed in advance</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Scale className="w-6 h-6 text-indigo-400" />
                Intellectual Property
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>All content, features, and functionality of MoneyMind AI are owned by us and protected by intellectual property laws.</p>
                <p>You may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Copy, modify, or distribute our proprietary content</li>
                  <li>Use our trademarks without permission</li>
                  <li>Reverse engineer or attempt to extract our source code</li>
                  <li>Create derivative works based on our service</li>
                </ul>
              </div>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Gavel className="w-6 h-6 text-indigo-400" />
                Limitation of Liability
              </h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>To the fullest extent permitted by law:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Our service is provided "as is" without warranties</li>
                  <li>We are not liable for indirect or consequential damages</li>
                  <li>Our total liability is limited to the amount paid for the service</li>
                  <li>We are not responsible for third-party services or content</li>
                  <li>Financial advice provided is for informational purposes only</li>
                </ul>
              </div>
            </motion.div>

            {/* Termination */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Termination</h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>We may terminate or suspend your account immediately for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violation of these terms</li>
                  <li>Illegal or unauthorized use of the service</li>
                  <li>Non-payment of fees</li>
                  <li>Extended inactivity</li>
                </ul>
                <p>Upon termination, you lose access to your account and data.</p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ scale: 1.02 }}
              className="border border-indigo-400/30 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-indigo-200/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
              <div className="space-y-4 text-[var(--muted-text)]">
                <p>For questions about these Terms & Conditions, please contact us:</p>
                <div className="space-y-2">
                  <p>Email: legal@moneymind.ai</p>
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
