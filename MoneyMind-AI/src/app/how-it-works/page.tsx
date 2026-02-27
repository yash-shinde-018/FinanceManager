'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  HelpCircle,
  CheckCircle,
  Cpu,
  Cloud,
  Database
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function HowItWorks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getGradientClass = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const steps = [
    {
      id: 1,
      title: "Connect Your Accounts",
      description: "Securely link your bank accounts, credit cards, and financial accounts",
      icon: Database,
      color: "blue",
      features: ["Bank-level encryption", "Multi-factor authentication", "Read-only access"]
    },
    {
      id: 2,
      title: "AI Analysis",
      description: "Our AI analyzes your spending patterns and financial behavior",
      icon: Brain,
      color: "purple",
      features: ["Machine learning algorithms", "Pattern recognition", "Behavioral analysis"]
    },
    {
      id: 3,
      title: "Smart Insights",
      description: "Get personalized insights and recommendations for better financial decisions",
      icon: TrendingUp,
      color: "green",
      features: ["Real-time insights", "Predictive analytics", "Actionable recommendations"]
    },
    {
      id: 4,
      title: "Automated Tracking",
      description: "Continuously monitor and categorize transactions automatically",
      icon: Zap,
      color: "orange",
      features: ["Auto-categorization", "Real-time updates", "Smart notifications"]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "256-bit encryption and multi-factor authentication keep your data safe"
    },
    {
      icon: Cpu,
      title: "AI-Powered",
      description: "Advanced machine learning algorithms provide intelligent insights"
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      description: "Access your financial data anywhere, anytime with automatic cloud sync"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor your financial health with live dashboards and reports"
    }
  ];

  useEffect(() => {
    // Removed auto-rotation
  }, []);

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
      {/* Interactive Particles Background */}
      <InteractiveParticles />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              How It Works
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Transform Your
              <span className="text-gradient"> Finances</span>
            </h1>
            <p className="text-xl text-[var(--muted-text)] max-w-3xl mx-auto">
              Experience the power of AI-driven financial management in four simple steps
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-blue-950/50 backdrop-blur-md border-2 border-blue-500/50 rounded-lg p-6 hover:border-blue-400 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getGradientClass(step.color)} flex items-center justify-center mb-4`}>
                  {React.createElement(step.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[var(--muted-text)] mb-4">{step.description}</p>
                <div className="space-y-2">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-blue-950/50 backdrop-blur-md border-2 border-blue-500/50 rounded-lg p-6 hover:border-blue-400 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    {React.createElement(feature.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--muted-text)]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 backdrop-blur-md border-2 border-blue-500/50 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Finances?</h2>
              <p className="text-xl text-[var(--muted-text)] mb-8">Join thousands of users who have already taken control of their financial future</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Try Demo
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 border-2 border-blue-500 text-blue-400 px-8 py-4 rounded-lg hover:bg-blue-500/10 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            </div>
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
                <li><a href="#features" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Features</a></li>
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
