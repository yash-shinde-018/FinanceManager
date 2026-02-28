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
  Filter,
  PiggyBank,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { mlClient } from '@/lib/ml/client';

const categories = [
  { id: 'all', label: 'All Insights', icon: Brain, mlModel: null },
  { id: 'savings', label: 'Savings', icon: PiggyBank, mlModel: 'savings' },
  { id: 'health', label: 'Financial Health', icon: Shield, mlModel: 'savings' },
  { id: 'overspending', label: 'Spending Alerts', icon: TrendingDown, mlModel: 'prediction' },
  { id: 'anomaly', label: 'Anomalies', icon: AlertTriangle, mlModel: 'fraud' },
  { id: 'forecast', label: 'Forecasts', icon: Target, mlModel: 'prediction' },
  { id: 'tip', label: 'Tips', icon: Zap, mlModel: null },
];

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'savings':
    case 'positive':
      return PiggyBank;
    case 'health':
      return Shield;
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
  const [mlStatus, setMlStatus] = useState({
    categorization: false,
    prediction: false,
    fraud: false,
    savings: false,
  });

  useEffect(() => {
    // Check ML models health
    const checkMLHealth = async () => {
      try {
        const health = await mlClient.healthCheck();
        setMlStatus(health);
      } catch (error) {
        console.error('ML health check failed:', error);
      }
    };
    
    checkMLHealth();
    
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

        // Calculate financial metrics for savings API
        let totalIncome = 0;
        let totalExpense = 0;
        let foodSpending = 0;
        let subscriptionSpending = 0;
        let emiSpending = 0;
        let investmentSpending = 0;
        
        // Calculate volatility (standard deviation of monthly expenses)
        const monthlyExpenses: number[] = [];
        const monthlyMap = new Map<string, number>();
        
        transactions.forEach((t) => {
          const amount = Number(t.amount);
          const category = (t.category || '').toLowerCase();
          
          if (t.type === 'income') {
            totalIncome += amount;
          } else {
            totalExpense += amount;
            
            // Categorize expenses
            if (category.includes('food')) foodSpending += amount;
            else if (category.includes('subscription')) subscriptionSpending += amount;
            else if (category.includes('emi') || category.includes('loan')) emiSpending += amount;
            else if (category.includes('invest')) investmentSpending += amount;
            
            // Monthly aggregation for volatility
            const date = new Date(t.occurred_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
          }
        });
        
        // Calculate volatility
        const monthlyValues = Array.from(monthlyMap.values());
        const avgExpense = monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;
        const variance = monthlyValues.reduce((acc, val) => acc + Math.pow(val - avgExpense, 2), 0) / monthlyValues.length;
        const volatility = Math.sqrt(variance) / (avgExpense || 1);
        
        const savings = totalIncome - totalExpense;
        
        // Get savings insights from ML API
        const formattedInsights: AIInsight[] = [];
        
        // Build monthly data for spending prediction (need 3+ months)
        const monthlyDataForPrediction: any[] = [];
        const monthlyDetailMap = new Map<string, {
          total_expense: number;
          total_income: number;
          expense_food: number;
          expense_travel: number;
          expense_bills: number;
          expense_emi: number;
          expense_shopping: number;
          expense_investment: number;
          expense_healthcare: number;
          expense_entertainment: number;
          expense_subscription: number;
          expense_transfer: number;
          expense_others: number;
        }>();
        
        transactions.forEach((t) => {
          const amount = Number(t.amount);
          const date = new Date(t.occurred_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          const category = (t.category || '').toLowerCase();
          
          if (!monthlyDetailMap.has(monthKey)) {
            monthlyDetailMap.set(monthKey, {
              total_expense: 0,
              total_income: 0,
              expense_food: 0,
              expense_travel: 0,
              expense_bills: 0,
              expense_emi: 0,
              expense_shopping: 0,
              expense_investment: 0,
              expense_healthcare: 0,
              expense_entertainment: 0,
              expense_subscription: 0,
              expense_transfer: 0,
              expense_others: 0,
            });
          }
          
          const monthData = monthlyDetailMap.get(monthKey)!;
          
          if (t.type === 'expense') {
            monthData.total_expense += amount;
            
            // Categorize expenses for prediction API
            if (category.includes('food')) monthData.expense_food += amount;
            else if (category.includes('travel') || category.includes('transport')) monthData.expense_travel += amount;
            else if (category.includes('bill') || category.includes('utility')) monthData.expense_bills += amount;
            else if (category.includes('emi') || category.includes('loan')) monthData.expense_emi += amount;
            else if (category.includes('shop')) monthData.expense_shopping += amount;
            else if (category.includes('invest')) monthData.expense_investment += amount;
            else if (category.includes('health') || category.includes('medical')) monthData.expense_healthcare += amount;
            else if (category.includes('entertainment') || category.includes('movie')) monthData.expense_entertainment += amount;
            else if (category.includes('subscription')) monthData.expense_subscription += amount;
            else if (category.includes('transfer')) monthData.expense_transfer += amount;
            else monthData.expense_others += amount;
          } else {
            monthData.total_income += amount;
          }
        });
        
        // Convert map to array sorted by date
        monthlyDetailMap.forEach((data, date) => {
          monthlyDataForPrediction.push({ date, ...data });
        });
        monthlyDataForPrediction.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Get spending prediction if we have 12+ months (API requirement)
        if (monthlyDataForPrediction.length >= 12) {
          try {
            const predictionResult = await mlClient.predictSpending(monthlyDataForPrediction);
            
            if (predictionResult && predictionResult.predicted_expense) {
              const predValue = Math.abs(predictionResult.predicted_expense);
              const lower = typeof predictionResult.confidence_interval === 'object' && 'lower' in predictionResult.confidence_interval 
                ? Math.abs(predictionResult.confidence_interval.lower)
                : 0;
              const upper = typeof predictionResult.confidence_interval === 'object' && 'upper' in predictionResult.confidence_interval 
                ? Math.abs(predictionResult.confidence_interval.upper)
                : 0;
              
              formattedInsights.push({
                id: 'spending-forecast',
                type: 'forecast',
                title: 'AI Spending Forecast',
                description: `Based on your spending patterns, AI predicts your next month's spending will be approximately ₹${predValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. ${lower && upper ? `Expected range: ₹${lower.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ₹${upper.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.` : ''} Model: ${predictionResult.model_used || 'LinearRegression'}`,
                severity: 'info',
                timestamp: new Date(),
                actionRequired: false,
              });
            }
          } catch (error) {
            console.error('Error getting spending prediction:', error);
          }
        } else {
          // Add a tip about needing more data
          formattedInsights.push({
            id: 'forecast-pending',
            type: 'tip',
            title: 'Spending Forecast Coming Soon',
            description: `Add more transactions to get AI spending predictions! You currently have ${monthlyDataForPrediction.length} months of data. We need at least 12 months for accurate predictions.`,
            severity: 'info',
            timestamp: new Date(),
            actionRequired: false,
          });
        }
        
        try {
          const savingsResult = await mlClient.getSavingsInsights({
            income: totalIncome,
            expense: totalExpense,
            savings: Math.max(0, savings),
            food_spending: foodSpending,
            subscription_spending: subscriptionSpending,
            emi_spending: emiSpending,
            investment_spending: investmentSpending,
            volatility: Math.min(volatility, 1.0),
          });
          
          if (savingsResult) {
            // Add financial health score insight
            formattedInsights.push({
              id: 'savings-health',
              type: 'savings',
              title: `Financial Health: ${savingsResult.behavior_class}`,
              description: savingsResult.score_message,
              severity: savingsResult.financial_health_score >= 70 ? 'success' : 
                       savingsResult.financial_health_score >= 50 ? 'warning' : 'alert',
              timestamp: new Date(),
              actionRequired: savingsResult.financial_health_score < 70,
              actionText: 'View Details',
            });
            
            // Add recommendations as separate insights
            savingsResult.recommendations.forEach((rec, index) => {
              formattedInsights.push({
                id: `savings-rec-${index}`,
                type: 'savings',
                title: 'Savings Recommendation',
                description: rec,
                severity: 'info',
                timestamp: new Date(),
                actionRequired: true,
                actionText: 'Learn More',
              });
            });
          }
        } catch (error) {
          console.error('Error getting savings insights:', error);
        }

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
      } catch (error) {
        console.error('Error loading insights:', error);
        setInsights([
          {
            id: '1',
            type: 'tip',
            title: 'AI Insights',
            description: 'Add transactions to get personalized insights. Make sure ML API is running on all ports (8000-8003).',
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
          const isModelActive = category.mlModel 
            ? mlStatus[category.mlModel as keyof typeof mlStatus]
            : true;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap relative',
                selectedCategory === category.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--muted-text)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-4 h-4" />
              {category.label}
              {category.mlModel && (
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full absolute -top-0.5 -right-0.5',
                  isModelActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                )} />
              )}
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
