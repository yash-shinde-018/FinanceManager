'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Filter, TrendingUp, BookOpen, MessageSquare, Heart, Share2, Bookmark } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "AI Revolution in Personal Finance Management",
    excerpt: "Discover how artificial intelligence is transforming the way we manage our personal finances, from automated budgeting to predictive spending analysis.",
    author: "Sarah Chen",
    date: "2024-02-20",
    readTime: "8 min read",
    category: "AI & Finance",
    image: "/api/placeholder/400/250",
    tags: ["AI", "Personal Finance", "Technology"],
    featured: true,
    likes: 234,
    comments: 45,
    views: 1520
  },
  {
    id: 2,
    title: "Building Wealth in Your 20s: A Strategic Guide",
    excerpt: "Learn proven strategies for building substantial wealth early in life, including investment principles and financial habits that compound over time.",
    author: "Michael Roberts",
    date: "2024-02-18",
    readTime: "12 min read",
    category: "Wealth Building",
    image: "/api/placeholder/400/250",
    tags: ["Investing", "Wealth", "Strategy"],
    featured: false,
    likes: 189,
    comments: 32,
    views: 980
  },
  {
    id: 3,
    title: "The Psychology of Smart Spending",
    excerpt: "Understanding the mental triggers behind financial decisions and how to develop a mindset that promotes intelligent spending habits.",
    author: "Dr. Emily Johnson",
    date: "2024-02-15",
    readTime: "6 min read",
    category: "Behavioral Finance",
    image: "/api/placeholder/400/250",
    tags: ["Psychology", "Spending", "Habits"],
    featured: false,
    likes: 156,
    comments: 28,
    views: 750
  },
  {
    id: 4,
    title: "Cryptocurrency and Traditional Banking: Finding Balance",
    excerpt: "Exploring how digital currencies are reshaping the financial landscape and what it means for traditional banking systems.",
    author: "Alex Thompson",
    date: "2024-02-12",
    readTime: "10 min read",
    category: "Digital Finance",
    image: "/api/placeholder/400/250",
    tags: ["Crypto", "Banking", "Digital"],
    featured: true,
    likes: 298,
    comments: 67,
    views: 2100
  },
  {
    id: 5,
    title: "Emergency Funds: Your Financial Safety Net",
    excerpt: "Why emergency funds are crucial and how to build one that protects you during unexpected life events.",
    author: "Lisa Martinez",
    date: "2024-02-10",
    readTime: "7 min read",
    category: "Financial Planning",
    image: "/api/placeholder/400/250",
    tags: ["Emergency", "Planning", "Safety"],
    featured: false,
    likes: 145,
    comments: 19,
    views: 620
  },
  {
    id: 6,
    title: "Tax Optimization Strategies for High Earners",
    excerpt: "Advanced tax strategies that can help high-income individuals minimize their tax burden while staying compliant.",
    author: "Robert Kim",
    date: "2024-02-08",
    readTime: "15 min read",
    category: "Tax Planning",
    image: "/api/placeholder/400/250",
    tags: ["Tax", "Optimization", "Legal"],
    featured: false,
    likes: 201,
    comments: 41,
    views: 1100
  }
];

const categories = ["All", "AI & Finance", "Wealth Building", "Behavioral Finance", "Digital Finance", "Financial Planning", "Tax Planning"];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="inline-block"
              style={{
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-transparent">
                Financial Insights
              </h1>
            </motion.div>
            <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
              Expert analysis, market trends, and actionable strategies to help you master your financial future
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl font-bold text-white">Featured Articles</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  <motion.div
                    animate={{ 
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ 
                      duration: 10, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white/50" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-slate-700/50 text-gray-300 text-xs rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}

      {/* Regular Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-8"
        >
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h2 className="text-3xl font-bold text-white">Latest Articles</h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="relative h-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/30" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-400 font-medium">
                    {post.category}
                  </span>
                  
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-xs">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Financial Insights
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get weekly updates on market trends, investment strategies, and exclusive financial tips delivered to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">MoneyMind AI</h3>
              <p className="text-gray-400">
                Empowering your financial journey with AI-driven insights and personalized strategies.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-gray-400">
            <p>Made with care for your financial future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
