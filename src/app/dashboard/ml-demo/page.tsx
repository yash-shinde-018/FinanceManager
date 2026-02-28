'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Tag, TrendingUp, Shield, PiggyBank, Loader2, CheckCircle2 } from 'lucide-react';
import { mlClient } from '@/lib/ml/client';

export default function MLDemoPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});

  // Test Expense Categorization
  const testCategorization = async () => {
    setLoading('categorization');
    try {
      const result = await mlClient.categorizeTransaction({
        date: new Date().toISOString().split('T')[0],
        description: 'Starbucks Coffee',
        amount: 450,
      });
      setResults({ ...results, categorization: result });
    } catch (error) {
      console.error('Categorization test failed:', error);
      setResults({ ...results, categorization: { error: 'Failed to categorize' } });
    } finally {
      setLoading(null);
    }
  };

  // Test Spending Prediction
  const testPrediction = async () => {
    setLoading('prediction');
    try {
      // Generate 12 months of sample data
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        return {
          date: date.toISOString().split('T')[0],
          total_expense: 45000 + Math.random() * 10000,
          total_income: 75000,
          expense_food: 8000 + Math.random() * 2000,
          expense_travel: 3000 + Math.random() * 1000,
          expense_bills: 5000,
          expense_emi: 10000,
          expense_shopping: 6000 + Math.random() * 2000,
          expense_investment: 5000,
          expense_healthcare: 2000,
          expense_entertainment: 3000 + Math.random() * 1000,
          expense_subscription: 1500,
          expense_transfer: 2000,
          expense_others: 1500,
        };
      });

      const result = await mlClient.predictSpending(monthlyData);
      setResults({ ...results, prediction: result });
    } catch (error) {
      console.error('Prediction test failed:', error);
      setResults({ ...results, prediction: { error: 'Failed to predict' } });
    } finally {
      setLoading(null);
    }
  };

  // Test Fraud Detection
  const testFraud = async () => {
    setLoading('fraud');
    try {
      const result = await mlClient.detectFraud({
        id: 12345,
        date: new Date().toISOString().split('T')[0],
        description: 'Large unusual transaction',
        amount: 95000,
        category: 'shopping',
      });
      setResults({ ...results, fraud: result });
    } catch (error) {
      console.error('Fraud test failed:', error);
      setResults({ ...results, fraud: { error: 'Failed to detect fraud' } });
    } finally {
      setLoading(null);
    }
  };

  // Test Savings Recommendation
  const testSavings = async () => {
    setLoading('savings');
    try {
      const result = await mlClient.getSavingsInsights({
        income: 75000,
        expense: 48000,
        savings: 27000,
        food_spending: 9000,
        subscription_spending: 1500,
        emi_spending: 10000,
        investment_spending: 5000,
        volatility: 0.15,
      });
      setResults({ ...results, savings: result });
    } catch (error) {
      console.error('Savings test failed:', error);
      setResults({ ...results, savings: { error: 'Failed to get recommendations' } });
    } finally {
      setLoading(null);
    }
  };

  const models = [
    {
      id: 'categorization',
      name: 'Expense Categorization',
      icon: Tag,
      color: 'from-purple-500 to-pink-500',
      test: testCategorization,
      description: 'Automatically categorize transactions using ML',
    },
    {
      id: 'prediction',
      name: 'Spending Prediction',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      test: testPrediction,
      description: 'Forecast future spending patterns',
    },
    {
      id: 'fraud',
      name: 'Fraud Detection',
      icon: Shield,
      color: 'from-red-500 to-orange-500',
      test: testFraud,
      description: 'Detect anomalies and suspicious transactions',
    },
    {
      id: 'savings',
      name: 'Savings Recommendation',
      icon: PiggyBank,
      color: 'from-green-500 to-emerald-500',
      test: testSavings,
      description: 'Get personalized savings recommendations',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ML Models Demo</h1>
        <p className="text-[var(--muted-text)]">
          Test all 4 AI models running on 10.230.58.46
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-glass p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                  <model.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-[var(--muted-text)]">
                    {model.description}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={model.test}
              disabled={loading === model.id}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading === model.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : results[model.id] ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Test Again
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Test Model
                </>
              )}
            </button>

            {results[model.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[var(--glass-bg)] rounded-lg p-4 overflow-auto max-h-64"
              >
                <p className="text-xs font-mono text-[var(--muted-text)] mb-2">
                  Response:
                </p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(results[model.id], null, 2)}
                </pre>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="card-glass p-6">
        <h3 className="font-semibold mb-4">Integration Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted-text)]">Base URL:</span>
            <span className="font-mono">http://10.230.58.46</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-text)]">Categorization:</span>
            <span className="font-mono">:8000/predict</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-text)]">Prediction:</span>
            <span className="font-mono">:8001/predict</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-text)]">Fraud Detection:</span>
            <span className="font-mono">:8002/detect</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-text)]">Savings:</span>
            <span className="font-mono">:8003/analyze</span>
          </div>
        </div>
      </div>
    </div>
  );
}
