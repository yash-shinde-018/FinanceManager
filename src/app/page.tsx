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

  Lock

} from 'lucide-react';

import { cn } from '@/lib/utils';

import MolecularNet from '@/components/MolecularNet';

import Feature3DCarousel from '@/components/Feature3DCarousel';



const stats = [

  { value: '₹2.4B+', label: 'Transactions Tracked' },

  { value: '500K+', label: 'Active Users' },

  { value: '99.9%', label: 'Uptime SLA' },

  { value: '4.9/5', label: 'User Rating' },

];



export default function LandingPage() {

  return (

    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">

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



      {/* Hero Section */}

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">

        {/* Background Effects */}

        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-2xl" />

          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-2xl" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-2xl" />

        </div>

        {/* Molecular Net Effect */}

        <MolecularNet />



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



          <Feature3DCarousel className="mb-16" />

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

                    { icon: Wallet, label: 'Total Balance', value: '₹24,562.00', change: '+12.5%' },

                    { icon: PieChart, label: 'Monthly Spending', value: '₹3,840.00', change: '-5.2%' },

                    { icon: TrendingUp, label: 'Predicted', value: '₹4,200.00', change: 'AI' },

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

      <footer className="border-t border-[var(--glass-border)] py-16 bg-gradient-to-b from-transparent to-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12"
          >
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            >
              <Link href="/" className="flex items-center gap-3 mb-4 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient group-hover:text-indigo-400 transition-colors duration-300">
                  MoneyMind AI
                </span>
              </Link>
              <p className="text-[var(--muted-text)] text-sm leading-relaxed mb-6">
                Transform your financial future with AI-powered insights. Track expenses, predict spending, and achieve your goals with intelligent automation.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-4.4869 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-indigo-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.75.097.118.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.022C24.007 5.367 18.641.001 12.017.001z"/></svg>
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

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <h3 className="text-white font-semibold mb-6">Support</h3>
              <ul className="space-y-4">
                <li><a href="/help" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
                <li><a href="/privacy" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</a></li>
                <li><a href="/terms" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Terms of Service</a></li>
                <li><a href="/security" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">Security</a></li>
                <li><a href="/status" className="text-[var(--muted-text)] hover:text-indigo-400 transition-all duration-300 hover:translate-x-1 inline-block">System Status</a></li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
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
                <a href="#" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-300">Privacy</a>
                <a href="#" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-300">Terms</a>
                <a href="#" className="text-[var(--muted-text)] hover:text-indigo-400 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>

    </div>

  );

}

