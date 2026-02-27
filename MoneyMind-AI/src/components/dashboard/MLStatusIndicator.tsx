'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Server,
  TrendingUp,
  Shield,
  Sparkles,
  Tag
} from 'lucide-react';
import { mlClient } from '@/lib/ml/client';
import { cn } from '@/lib/utils';

interface ServiceStatus {
  name: string;
  port: number;
  status: 'checking' | 'connected' | 'disconnected';
  icon: React.ElementType;
  description: string;
}

export default function MLStatusIndicator() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Expense Categorization',
      port: 8000,
      status: 'checking',
      icon: Tag,
      description: 'Auto-categorizes transactions',
    },
    {
      name: 'Spending Prediction',
      port: 8001,
      status: 'checking',
      icon: TrendingUp,
      description: 'Predicts future spending',
    },
    {
      name: 'Fraud Detection',
      port: 8002,
      status: 'checking',
      icon: Shield,
      description: 'Detects suspicious transactions',
    },
    {
      name: 'Savings Insights',
      port: 8003,
      status: 'checking',
      icon: Sparkles,
      description: 'Personalized savings recommendations',
    },
  ]);
  const [overallStatus, setOverallStatus] = useState<'checking' | 'connected' | 'disconnected' | 'partial'>('checking');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const health = await mlClient.healthCheck();
      
      setServices(prev => prev.map(service => {
        let status: 'connected' | 'disconnected' = 'disconnected';
        if (service.port === 8000) status = health.categorize ? 'connected' : 'disconnected';
        else if (service.port === 8001) status = health.prediction ? 'connected' : 'disconnected';
        else if (service.port === 8002) status = health.fraud ? 'connected' : 'disconnected';
        else if (service.port === 8003) status = health.savings ? 'connected' : 'disconnected';
        
        return { ...service, status };
      }));

      const connectedCount = Object.values(health).filter(Boolean).length;
      if (connectedCount === 4) setOverallStatus('connected');
      else if (connectedCount === 0) setOverallStatus('disconnected');
      else setOverallStatus('partial');
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getOverallConfig = () => {
    switch (overallStatus) {
      case 'connected':
        return {
          icon: CheckCircle2,
          text: 'All ML Services Active',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          description: 'All 4 ML models are running',
        };
      case 'partial':
        return {
          icon: AlertCircle,
          text: 'Partial ML Service',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          description: 'Some ML services offline',
        };
      case 'disconnected':
        return {
          icon: XCircle,
          text: 'ML Services Offline',
          color: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/30',
          description: 'Start ML APIs to enable AI features',
        };
      case 'checking':
        return {
          icon: AlertCircle,
          text: 'Checking ML Services...',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          description: 'Connecting to ML services',
        };
    }
  };

  const getServiceIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />;
    }
  };

  const config = getOverallConfig();
  const Icon = config.icon;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
          config.bgColor,
          config.borderColor,
          config.color,
          'hover:scale-105'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{config.text}</span>
        {overallStatus === 'checking' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-72 card-glass p-4 rounded-xl shadow-xl z-50"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
                <Server className={cn('w-5 h-5', config.color)} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">ML Service Status</h4>
                <p className="text-xs text-[var(--muted-text)]">{config.description}</p>
              </div>
            </div>

            {/* Individual Service Status */}
            <div className="space-y-2">
              {services.map((service) => {
                const ServiceIcon = service.icon;
                return (
                  <div 
                    key={service.port}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      service.status === 'connected' ? 'bg-emerald-500/10' : 
                      service.status === 'checking' ? 'bg-amber-500/10' : 'bg-rose-500/10'
                    )}>
                      <ServiceIcon className={cn(
                        'w-4 h-4',
                        service.status === 'connected' ? 'text-emerald-400' : 
                        service.status === 'checking' ? 'text-amber-400' : 'text-rose-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{service.name}</span>
                        {getServiceIcon(service.status)}
                      </div>
                      <span className="text-xs text-[var(--muted-text)]">{service.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {overallStatus === 'disconnected' && (
              <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <p className="text-xs text-rose-400 mb-2">
                  <strong>Start ML Services:</strong>
                </p>
                <div className="text-xs text-[var(--muted-text)] space-y-1">
                  <p>python categorize_api.py (port 8000)</p>
                  <p>python predict_api.py (port 8001)</p>
                  <p>python fraud_api.py (port 8002)</p>
                  <p>python savings_api.py (port 8003)</p>
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
              <div className="text-xs text-[var(--muted-text)] space-y-1">
                <p className="flex justify-between">
                  <span>ML API Base:</span>
                  <span className="text-indigo-400">10.230.58.46</span>
                </p>
                <p className="flex justify-between">
                  <span>Services:</span>
                  <span className="text-emerald-400">4 Active</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
