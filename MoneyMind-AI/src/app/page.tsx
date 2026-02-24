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
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Advanced machine learning algorithms analyze your spending patterns and provide personalized recommendations.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Predictions',
    description: 'Predict your future spending with confidence intervals and get ahead of your financial curve.',
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: '256-bit encryption and multi-factor authentication keep your financial data safe and secure.',
  },
  {
    icon: Sparkles,
    title: 'Anomaly Detection',
    description: 'Instantly detect unusual transactions and potential fraud with our AI monitoring system.',
  },
];

const stats = [
  { value: '$2.4B+', label: 'Transactions Tracked' },
  { value: '500K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9/5', label: 'User Rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 card-glass border-b border-[var(--glass-border)]">
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
              <a href="#how-it-works" className="text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">How It Works</a>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Now with Advanced AI Predictions
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Your Financial Future,
              <br />
              <span className="text-gradient">Powered by AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-[var(--muted-text)] mb-8 max-w-2xl mx-auto"
            >
              Experience the next generation of personal finance. Track expenses, predict spending,
              and achieve your goals with intelligent insights that adapt to your lifestyle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/demo" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Try AI Demo (No Signup)
                <Sparkles className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 text-sm text-[var(--muted-text)]"
            >
              Test all AI features instantly - no account needed!
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-[var(--muted-text)] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient">Master Your Money</span>
            </h2>
            <p className="text-[var(--muted-text)] text-lg">
              Powerful features designed to give you complete control over your finances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-glass p-6 hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted-text)]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Beautiful, <span className="text-gradient">Intuitive Dashboard</span>
            </h2>
            <p className="text-[var(--muted-text)] text-lg">
              See all your finances at a glance with our stunning, AI-powered interface
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="card-glass p-2 rounded-2xl overflow-hidden">
              <div className="bg-[var(--card-bg)] rounded-xl p-6 min-h-[400px]">
                {/* Mock Dashboard UI */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Wallet, label: 'Total Balance', value: '$24,562.00', change: '+12.5%' },
                    { icon: PieChart, label: 'Monthly Spending', value: '$3,840.00', change: '-5.2%' },
                    { icon: TrendingUp, label: 'Predicted', value: '$4,200.00', change: 'AI' },
                    { icon: Bell, label: 'Alerts', value: '3', change: 'New' },
                  ].map((card, i) => (
                    <div key={i} className="card-gradient p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <card.icon className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-[var(--muted-text)]">{card.label}</span>
                      </div>
                      <div className="text-xl font-bold">{card.value}</div>
                      <div className={cn(
                        "text-xs mt-1",
                        card.change.startsWith('+') ? "text-emerald-400" :
                          card.change === 'AI' ? "text-indigo-400" :
                            card.change === 'New' ? "text-amber-400" : "text-rose-400"
                      )}>
                        {card.change}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-gradient p-4 rounded-xl h-48 flex items-center justify-center">
                    <span className="text-[var(--muted-text)]">Spending Trends Chart</span>
                  </div>
                  <div className="card-gradient p-4 rounded-xl h-48 flex items-center justify-center">
                    <span className="text-[var(--muted-text)]">Category Distribution</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card-glass p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 animated-gradient opacity-10" />
            <div className="relative z-10">
              <Target className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Finances?
              </h2>
              <p className="text-[var(--muted-text)] text-lg mb-8 max-w-xl mx-auto">
                Join 500,000+ users who have already discovered the power of AI-driven financial management.
              </p>
              <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">MoneyMind AI</span>
            </Link>
            <p className="text-sm text-[var(--muted-text)]">
              © 2025 MoneyMind AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Terms</a>
              <a href="#" className="text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
