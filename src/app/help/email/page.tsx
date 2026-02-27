'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  Mail,
  ArrowLeft,
  Clock,
  MessageCircle,
  CheckCircle,
  Send,
  ExternalLink,
  Phone
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function EmailSupport() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      {/* Interactive Particles covering entire page */}
      <InteractiveParticles />

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
              <a href="/#features" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Features</a>
              <a href="/how-it-works" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">How It Works</a>
              <a href="/#pricing" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="btn-secondary hidden sm:block">Sign In</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Email Support
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Get Help via
              <span className="text-gradient"> Email</span>
            </h1>
            <p className="text-xl text-[var(--muted-text)] max-w-2xl mx-auto">
              Our support team is ready to help you with any questions or issues you may have.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border border-slate-700/50 rounded-xl p-8 bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm mb-8"
          >
            <div className="text-center mb-8">
              <Mail className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Email Us</h2>
              <p className="text-[var(--muted-text)] mb-6">We typically respond within 24 hours</p>
              <Link
                href="mailto:support@moneymind.ai"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <Send className="w-5 h-5" />
                support@moneymind.ai
              </Link>
            </div>
          </motion.div>

          {/* Response Times */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-900/30 to-slate-800/20 border border-slate-700/50 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Standard</h3>
              <p className="text-[var(--muted-text)] mb-2">24-48 hours</p>
              <p className="text-sm text-slate-400">General inquiries</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-slate-800/20 border border-slate-700/50 rounded-xl p-6 text-center">
              <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Priority</h3>
              <p className="text-[var(--muted-text)] mb-2">12-24 hours</p>
              <p className="text-sm text-slate-400">Premium users</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-slate-800/20 border border-slate-700/50 rounded-xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Urgent</h3>
              <p className="text-[var(--muted-text)] mb-2">2-6 hours</p>
              <p className="text-sm text-slate-400">Critical issues</p>
            </div>
          </motion.div>

          {/* What to Include */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="border border-slate-700/50 rounded-xl p-8 bg-gradient-to-br from-indigo-900/30 to-slate-800/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">What to Include in Your Email</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Your Account Information</h3>
                  <p className="text-[var(--muted-text)]">Account email and user ID (if applicable)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Detailed Description</h3>
                  <p className="text-[var(--muted-text)]">Clear explanation of your issue or question</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Steps Taken</h3>
                  <p className="text-[var(--muted-text)]">What you've already tried to resolve the issue</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Screenshots</h3>
                  <p className="text-[var(--muted-text)]">If applicable, include screenshots of the issue</p>
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
            <p className="text-[var(--muted-text)] mb-4">Need faster help?</p>
            <Link
              href="/help/call"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              <Phone className="w-5 h-5" />
              Try Call Support
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">MoneyMind AI</span>
              </Link>
              <p className="mt-4 text-sm text-[var(--muted-text)]">
                Transform your financial future with AI-powered insights. Track expenses, predict spending, and achieve your goals.
              </p>
              <div className="flex gap-4 mt-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-4.4869 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </a>
              </div>
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

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <h3 className="text-white font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                <li><a href="/help" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
                <li><a href="/privacy" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</a></li>
                <li><a href="/terms" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Terms of Service</a></li>
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
