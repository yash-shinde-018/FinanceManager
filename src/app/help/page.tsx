'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  Brain,
  Shield,
  HelpCircle,
  MessageCircle,
  Book,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

const helpCategories = [
  {
    icon: Book,
    title: 'Getting Started',
    description: 'Learn the basics of MoneyMind AI',
    bgColor: 'bg-blue-500/10',
    items: [
      { question: 'How do I create an account?', answer: 'Simply click "Get Started" on the homepage and follow the quick registration process. It takes less than 2 minutes.' },
      { question: 'What information do I need to provide?', answer: 'You only need your email and a secure password. We recommend enabling two-factor authentication for added security.' },
      { question: 'Can I try the features before signing up?', answer: 'Yes! Try our AI Demo without any signup to experience the power of MoneyMind AI firsthand.' }
    ]
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Understand how we protect your data',
    bgColor: 'bg-green-500/10',
    items: [
      { question: 'Is my financial data secure?', answer: 'Yes, we use bank-level 256-bit encryption and never share your personal data with third parties.' },
      { question: 'What is two-factor authentication?', answer: '2FA adds an extra layer of security by requiring a verification code from your phone when logging in.' },
      { question: 'Can I delete my account and data?', answer: 'Yes, you can delete your account and all associated data at any time from your account settings.' }
    ]
  },
  {
    icon: MessageCircle,
    title: 'Troubleshooting',
    description: 'Get help with common issues',
    bgColor: 'bg-purple-500/10',
    items: [
      { question: "Why can't I log in?", answer: 'Check your email/password, ensure caps lock is off, or try resetting your password if needed.' },
      { question: 'Transactions not syncing?', answer: 'Ensure you have stable internet connection and try refreshing. Contact support if issues persist.' },
      { question: 'App running slowly?', answer: 'Clear your browser cache, ensure you have the latest app version, or try using a different browser.' }
    ]
  }
];

export default function HelpCenter() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

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
              <Link href="/login" className="btn-secondary hidden sm:block">Sign In</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>
      
      <InteractiveParticles />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                <HelpCircle className="w-4 h-4" />
                Help Center
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              How can we<br /><span className="text-gradient">help you today?</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-xl text-[var(--muted-text)] mb-8 max-w-2xl mx-auto">
              Find answers and guides to make the most of your MoneyMind AI experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            
            {/* Category-wise Questions */}
            {helpCategories.map((category, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }}>
                <div className="border-b border-slate-700/50 pb-12">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-white">{category.title}</h2>
                  </div>
                  
                  <p className="text-slate-400 text-base ml-13">{category.description}</p>
                  
                  <div className="space-y-2 mt-6 ml-13">
                    {category.items.map((item, itemIndex) => {
                      const itemId = `${index}-${itemIndex}`;
                      const isExpanded = expandedItems.includes(itemId);
                      return (
                        <div key={itemIndex} className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/20">
                          <button onClick={() => toggleItem(itemId)} className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-700/20 transition-colors duration-200">
                            <h3 className="text-base font-medium text-slate-200 pr-4">{item.question}</h3>
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                          </button>
                          
                          <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="px-5 pb-4">
                              <div className="border-t border-slate-700/50 pt-3">
                                <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Contact Support */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
              <div className="border border-slate-700/50 rounded-xl p-8 bg-slate-800/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-slate-300" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white">Contact Support</h2>
                </div>
                
                <p className="text-slate-400 mb-8 ml-13">Need additional assistance? Our support team is ready to help.</p>
                
                <div className="grid md:grid-cols-2 gap-4 ml-13">
                  <Link href="/help/email" className="flex items-center gap-4 p-4 border border-slate-700/50 rounded-lg hover:bg-slate-700/20 transition-colors duration-200">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">Email Support</h3>
                      <p className="text-sm text-slate-400">Send us a message</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                  </Link>

                  <Link href="/help/contact" className="flex items-center gap-4 p-4 border border-slate-700/50 rounded-lg hover:bg-slate-700/20 transition-colors duration-200">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white">Contact Support</h3>
                      <p className="text-sm text-slate-400">Get in touch</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                  </Link>
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
            <div>
              <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">MoneyMind AI</span>
              </Link>
              <p className="mt-4 text-sm text-[var(--muted-text)]">
                Your intelligent financial companion for smarter money management.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Home</a></li>
                <li><a href="#features" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Features</a></li>
                <li><a href="/how-it-works" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">How It Works</a></li>
                <li><a href="#pricing" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Pricing</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="/help" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Help Center</a></li>
                <li><a href="mailto:support@moneymind.ai" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Contact Us</a></li>
                <li><a href="/privacy" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="/terms" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">About Us</a></li>
                <li><a href="/blog" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Blog</a></li>
                <li><a href="/careers" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Careers</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[var(--glass-border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--muted-text)] text-sm">
              © 2026 MoneyMind AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Privacy</a>
              <a href="/terms" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Terms</a>
              <a href="/cookies" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
