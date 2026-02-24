'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  Target,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types';
import { createClient } from '@/lib/supabase/client';

const categories = [
  { id: 'all', label: 'All Insights', icon: Brain },
  { id: 'savings', label: 'Savings', icon: Lightbulb },
  { id: 'overspending', label: 'Spending Alerts', icon: TrendingDown },
  { id: 'anomaly', label: 'Anomalies', icon: AlertTriangle },
  { id: 'forecast', label: 'Forecasts', icon: Target },
  { id: 'tip', label: 'Tips', icon: Zap },
];

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'savings':
    case 'positive':
      return Lightbulb;
    case 'overspending':
    case 'warning':
      return TrendingDown;
    case 'anomaly':
      return AlertTriangle;
    case 'forecast':
      return Target;
    case 'tip':
    case 'recommendation':
      return Zap;
    case 'summary':
    case 'category':
    case 'pattern':
      return Brain;
    default:
      return Brain;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    case 'alert':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
    case 'info':
      return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400';
    default:
      return 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--muted-text)]';
  }
};

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const supabase = createClient();

        // Get user's transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('description, amount, type, category, occurred_at, is_anomaly')
          .order('occurred_at', { ascending: false })
          .limit(100);

        if (!transactions || transactions.length === 0) {
          setInsights([
            {
              id: '1',
              type: 'tip',
              title: 'Get Started',
              description: 'Add your first transaction to start receiving personalized AI insights about your spending patterns, savings opportunities, and anomaly detection!',
              severity: 'info',
              timestamp: new Date(),
              actionRequired: false,
            },
          ]);
          setLoading(false);
          return;
        }

        // Format transactions for ML API
        const mlTransactions = transactions.map(t => ({
          date: new Date(t.occurred_at).toISOString().split('T')[0],
          description: t.description,
          amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount),
          category: t.category,
        }));

        // Get insights from ML API
        const response = await fetch('http://localhost:8000/insights/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mlTransactions),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.insights) {
            // Convert ML insights to AIInsight format
            const formattedInsights: AIInsight[] = data.insights.map((insight: any, index: number) => {
              // Map insight types correctly
              let insightType = insight.type || 'tip';

              // Map 'overspending' to match filter category
              if (insightType === 'overspending') {
                insightType = 'overspending';
              }

              return {
                id: `ml-${index}`,
                type: insightType,
                title: insight.type === 'summary' ? 'Spending Summary' :
                  insight.type === 'category' ? 'Top Category' :
                    insight.type === 'overspending' ? 'Spending Alert' :
                      insight.type === 'forecast' ? 'AI Forecast' :
                        insight.type === 'pattern' ? 'Spending Pattern' :
                          insight.type === 'recommendation' ? 'AI Recommendation' : 'Insight',
                description: insight.message,
                severity: insight.severity === 'high' ? 'alert' :
                  insight.severity === 'medium' ? 'warning' :
                    insight.severity === 'low' ? 'success' : 'info',
                timestamp: new Date(),
                actionRequired: insight.type === 'overspending' || insight.type === 'recommendation',
                actionText: insight.type === 'overspending' ? 'Set Budget' : 'View Details',
              };
            });

            // Add anomaly insights from transactions
            const anomalies = transactions.filter(t => t.is_anomaly);
            anomalies.forEach((anomaly, index) => {
              formattedInsights.push({
                id: `anomaly-${index}`,
                type: 'anomaly',
                title: 'Unusual Transaction Detected',
                description: `A ₹${Math.abs(anomaly.amount).toFixed(2)} transaction at "${anomaly.description}" was flagged as unusual by our AI anomaly detection system.`,
                severity: 'alert',
                timestamp: new Date(anomaly.occurred_at),
                actionRequired: true,
                actionText: 'Review Transaction',
              });
            });

            setInsights(formattedInsights);
          }
        } else {
          throw new Error('Failed to get insights');
        }
      } catch (error) {
        console.error('Error loading insights:', error);
        setInsights([
          {
            id: '1',
            type: 'tip',
            title: 'AI Insights',
            description: 'Add transactions to get personalized insights. Make sure ML API is running on port 8000.',
            severity: 'info',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const filteredInsights = insights.filter(
    insight =>
      (selectedCategory === 'all' || insight.type === selectedCategory) &&
      !dismissedInsights.includes(insight.id)
  );

  const dismissInsight = (id: string) => {
    setDismissedInsights([...dismissedInsights, id]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const stats = {
    totalSavings: 0,
    totalAlerts: insights.filter(i => i.type === 'overspending' && !dismissedInsights.includes(i.id)).length,
    anomaliesResolved: 0,
    totalAnomalies: insights.filter(i => i.type === 'anomaly').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Insights</h1>
          <p className="text-[var(--muted-text)]">
            Smart recommendations powered by machine learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm">
            <Brain className="w-4 h-4 inline mr-1" />
            AI Powered
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{insights.length}</p>
              <p className="text-xs text-[var(--muted-text)]">Total Insights</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.totalAlerts}</p>
              <p className="text-xs text-[var(--muted-text)]">Spending Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-400">{stats.totalAnomalies}</p>
              <p className="text-xs text-[var(--muted-text)]">Anomalies Detected</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">{loading ? '...' : insights.length}</p>
              <p className="text-xs text-[var(--muted-text)]">AI Recommendations</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-[var(--muted-text)] shrink-0" />
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                selectedCategory === category.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--muted-text)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card-glass p-12 text-center">
            <Brain className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
            <h3 className="font-semibold text-lg mb-2">Loading AI Insights...</h3>
            <p className="text-[var(--muted-text)]">
              Analyzing your transactions with machine learning
            </p>
          </div>
        ) : filteredInsights.length > 0 ? (
          filteredInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'card-glass p-5 relative overflow-hidden',
                  'hover:border-indigo-500/30 transition-all duration-300'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border',
                    getSeverityColor(insight.severity)
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                            getSeverityColor(insight.severity)
                          )}>
                            {insight.type}
                          </span>
                          <span className="text-xs text-[var(--muted-text)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(insight.timestamp)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                        <p className="text-[var(--muted-text)] leading-relaxed">
                          {insight.description}
                        </p>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={() => dismissInsight(insight.id)}
                        className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--muted-text)] transition-colors shrink-0"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Action Button */}
                    {insight.actionRequired && (
                      <div className="mt-4 flex items-center gap-3">
                        <button className="btn-primary text-sm flex items-center gap-2">
                          {insight.actionText}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Indicator */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Brain className="w-24 h-24" />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="card-glass p-12 text-center">
            <Brain className="w-16 h-16 text-[var(--muted-text)] mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No insights found</h3>
            <p className="text-[var(--muted-text)]">
              {dismissedInsights.length > 0
                ? "You've dismissed all insights in this category."
                : selectedCategory === 'all'
                  ? "Add transactions to start receiving AI-powered insights!"
                  : "No insights available for this category yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
