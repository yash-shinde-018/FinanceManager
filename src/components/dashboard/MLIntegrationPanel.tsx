'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  PiggyBank, 
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { mlClient } from '@/lib/ml/client';

interface MLStatus {
  categorization: boolean;
  prediction: boolean;
  fraud: boolean;
  savings: boolean;
}

export default function MLIntegrationPanel() {
  const [status, setStatus] = useState<MLStatus>({
    categorization: false,
    prediction: false,
    fraud: false,
    savings: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMLHealth();
  }, []);

  const checkMLHealth = async () => {
    setLoading(true);
    try {
      const health = await mlClient.healthCheck();
      setStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const models = [
    {
      name: 'Expense Categorization',
      icon: Tag,
      status: status.categorization,
      port: 8000,
      description: 'Auto-categorize transactions',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Spending Prediction',
      icon: TrendingUp,
      status: status.prediction,
      port: 8001,
      description: 'Forecast future expenses',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Fraud Detection',
      icon: Shield,
      status: status.fraud,
      port: 8002,
      description: 'Detect anomalies & fraud',
      color: 'from-red-500 to-orange-500',
    },
    {
      name: 'Savings Recommendation',
      icon: PiggyBank,
      status: status.savings,
      port: 8003,
      description: 'Personalized savings tips',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="card-glass p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">ML Models Status</h3>
            <p className="text-sm text-[var(--muted-text)]">
              4 AI models running on 10.230.58.46
            </p>
          </div>
        </div>
        <button
          onClick={checkMLHealth}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 hover:border-indigo-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                <model.icon className="w-6 h-6 text-white" />
              </div>
              {loading ? (
                <Loader2 className="w-5 h-5 text-[var(--muted-text)] animate-spin" />
              ) : model.status ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
            </div>
            
            <h4 className="font-semibold mb-1">{model.name}</h4>
            <p className="text-sm text-[var(--muted-text)] mb-2">
              {model.description}
            </p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted-text)]">
                Port: {model.port}
              </span>
              <span className={`px-2 py-1 rounded-full ${
                model.status 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {model.status ? 'Online' : 'Offline'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && (!status.categorization || !status.prediction || !status.fraud || !status.savings) && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-400 mb-1">Some ML models are offline</p>
            <p className="text-[var(--muted-text)]">
              Make sure all ML services are running on 10.230.58.46
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
