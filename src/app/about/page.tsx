'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Target,
  Lightbulb,
  Award,
  Globe,
  Heart,
  Rocket,
  Brain,
  Shield,
  Zap,
  TrendingUp,
  Star,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  BarChart
} from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

export default function AboutUs() {
  const [activeTimeline, setActiveTimeline] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  const scaleRange = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });

  const timeline = [
    {
      year: "Phase 1",
      title: "The Concept and Blueprint",
      description: "We identified core problem and outlined a clear mission to help users achieve financial freedom, sketching initial blueprint before writing any code.",
      icon: Lightbulb,
      color: "from-purple-500 to-pink-500"
    },
    {
      year: "Phase 2",
      title: "Architecture and Planning",
      description: "We established technical foundation by selecting right technology stack and designing a secure, scalable database architecture.",
      icon: Brain,
      color: "from-blue-500 to-cyan-500"
    },
    {
      year: "Phase 3",
      title: "Design and Prototyping",
      description: "We translated raw ideas into visual prototypes, focusing on creating a clean, modern, and highly intuitive user experience for complex data.",
      icon: Palette,
      color: "from-green-500 to-emerald-500"
    },
    {
      year: "Phase 4",
      title: "Core Engineering and Development",
      description: "This was heavy lifting phase where we wrote code, built interactive features, and connected frontend to a robust backend.",
      icon: Code,
      color: "from-orange-500 to-red-500"
    },
    {
      year: "Phase 5",
      title: "Refinement, Testing, and Launch",
      description: "We rigorously stress-tested application to fix bugs and optimize performance before finally deploying platform live to our users.",
      icon: Rocket,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "User-Centric",
      description: "Every decision starts with our users' success",
      color: "text-red-500"
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Pushing boundaries with cutting-edge AI technology",
      color: "text-yellow-500"
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Bank-level security and complete transparency",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Agility",
      description: "Rapid iteration and continuous improvement",
      color: "text-purple-500"
    }
  ];

  const team = [
    {
      name: "Saurabh Sawant",
      role: "Team Leader",
      image: "/api/placeholder/300/300",
      bio: "Visionary leader with expertise in leadership, innovation, and security architecture",
      skills: ["Leadership", "Innovation", "Security"],
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Yash Shinde",
      role: "UI/UX Developer",
      image: "/api/placeholder/300/300",
      bio: "Creative developer specializing in user interface and experience design",
      skills: ["UI Design", "UX Research", "Frontend"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Nikhil Umbarkar",
      role: "Lead Architect",
      image: "/api/placeholder/300/300",
      bio: "Expert in system architecture and comprehensive testing strategies",
      skills: ["Architecture", "Testing", "DevOps"],
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Chaitanya Khurd",
      role: "AI Research Lead",
      image: "/api/placeholder/300/300",
      bio: "Deep learning specialist with expertise in NLP and Computer Vision",
      skills: ["Deep Learning", "NLP", "Computer Vision"],
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "100K+", label: "Active Users", icon: Users },
    { number: "$50M+", label: "Assets Managed", icon: TrendingUp },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "24/7", label: "Support", icon: Heart }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimeline((prev) => (prev + 1) % timeline.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [timeline.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
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
      {/* Animated Background */}
      <InteractiveParticles />
      <motion.section
        ref={containerRef}
        style={{ y: yRange, opacity: opacityRange }}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-sm">
              <Star className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">About Our Journey</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Revolutionizing
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Financial Intelligence
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            We're on a mission to democratize financial intelligence through cutting-edge AI technology, 
            making sophisticated financial management accessible to everyone.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/demo"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border border-white/20 rounded-lg font-semibold text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
        />
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <motion.div 
                  animate={{
                    backgroundColor: [
                      'rgba(255, 255, 255, 0.1)',
                      'rgba(59, 130, 246, 0.1)',
                      'rgba(34, 197, 94, 0.1)',
                      'rgba(249, 115, 22, 0.1)',
                      'rgba(168, 85, 247, 0.1)'
                    ]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    delay: index * 1.5,
                    ease: "easeInOut"
                  }}
                  className="relative backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center overflow-hidden"
                >
                  <motion.div 
                    animate={{
                      backgroundColor: [
                        'rgba(168, 85, 247, 0.1)',
                        'rgba(59, 130, 246, 0.1)',
                        'rgba(34, 197, 94, 0.1)',
                        'rgba(249, 115, 22, 0.1)',
                        'rgba(168, 85, 247, 0.1)'
                      ]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      delay: index * 1.5,
                      ease: "easeInOut"
                    }}
                    className="absolute top-0 right-0 w-20 h-20 rounded-2xl blur-2xl" 
                  />
                  <motion.div 
                    animate={{
                      backgroundColor: [
                        'rgba(236, 72, 153, 0.1)',
                        'rgba(6, 182, 212, 0.1)',
                        'rgba(16, 185, 129, 0.1)',
                        'rgba(239, 68, 68, 0.1)',
                        'rgba(236, 72, 153, 0.1)'
                      ]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      delay: index * 1.5,
                      ease: "easeInOut"
                    }}
                    className="absolute bottom-0 left-0 w-16 h-16 rounded-2xl blur-xl" 
                  />
                  
                  <motion.div
                    // animate={{ 
                    //   rotate: [0, 360],
                    //   scale: [1, 1.1, 1]
                    // }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      delay: index * 0.5,
                      ease: "easeInOut"
                    }}
                    className="relative w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #9333ea 100%)',
                      boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.25)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
                    <stat.icon className="w-10 h-10 text-white relative z-10" />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-white/90 font-medium group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    animate={{
                      backgroundColor: [
                        'rgba(255, 255, 255, 0.1)',
                        'rgba(59, 130, 246, 0.1)',
                        'rgba(34, 197, 94, 0.1)',
                        'rgba(249, 115, 22, 0.1)',
                        'rgba(255, 255, 255, 0.1)'
                      ]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      delay: index * 1.5,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 -skew-x-12 opacity-60" 
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Interactive Timeline */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              From a bold idea to a market leader in financial AI
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-1/2" />
                  
                  <motion.div
                    animate={{ scale: activeTimeline === index ? 1.2 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-slate-900 z-10"
                  />

                  <motion.div
                    whileHover={{ scale: 1.05, x: index % 2 === 0 ? 10 : -10 }}
                    className={`w-1/2 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}
                  >
                    <div className={`inline-block p-6 bg-gradient-to-br ${item.color} rounded-2xl text-white max-w-md`}>
                      <div className="flex items-center gap-3 mb-3">
                        <item.icon className="w-6 h-6" />
                        <span className="text-2xl font-bold">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-white/90">{item.description}</p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Values Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, rotate: 5 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center group"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors"
                >
                  <value.icon className={`w-8 h-8 ${value.color}`} />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-white/70">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              The brilliant minds behind MoneyMind AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -20, scale: 1.05 }}
                className="group h-full"
              >
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className={`h-48 bg-gradient-to-br ${member.color} flex items-center justify-center relative overflow-hidden`}>
                    <motion.div
                      animate={{}}
                      transition={{ }}
                      className="absolute w-32 h-32 bg-white/10 rounded-full blur-xl"
                    />
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center z-10">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                    <p className={`bg-gradient-to-r ${member.color} bg-clip-text text-transparent font-medium mb-3`}>{member.role}</p>
                    <p className="text-white/70 text-sm mb-4 flex-1">{member.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs border border-white/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of users who have already taken control of their finances with MoneyMind AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 border border-white/20 rounded-lg font-semibold text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Book a Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-gradient-to-b from-transparent to-black/50">
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">MoneyMind AI</span>
              </Link>
              <p className="mt-4 text-sm text-white/70">
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
                <li><a href="/#features" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="/how-it-works" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">How It Works</a></li>
                <li><a href="/pricing" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="/demo" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Demo</a></li>
                <li><a href="/api" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">API</a></li>
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
                <li><a href="/about" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">About Us</a></li>
                <li><a href="/blog" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Blog</a></li>
                <li><a href="/careers" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Careers</a></li>
                <li><a href="/press" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Press</a></li>
                <li><a href="/contact" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Contact</a></li>
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
                <li><a href="/privacy" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</a></li>
                <li><a href="/terms" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Terms & Conditions</a></li>
                <li><a href="/help" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Help Center</a></li>
                <li><a href="/cookies" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">Cookie Policy</a></li>
                <li><a href="/gdpr" className="text-white/70 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 inline-block">GDPR</a></li>
              </ul>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <p className="text-white/70 text-sm">
              © 2026 MoneyMind AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-white/70">Made with care for your financial future.</span>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="text-white/70 hover:text-purple-400 transition-colors duration-300">Privacy</a>
                <a href="/terms" className="text-white/70 hover:text-purple-400 transition-colors duration-300">Terms</a>
                <a href="/cookies" className="text-white/70 hover:text-purple-400 transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
