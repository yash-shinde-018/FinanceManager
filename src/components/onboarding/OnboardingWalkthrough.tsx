'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Wallet,
  Target,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to MoneyMind AI!',
    description: 'Let\'s take a quick tour to help you get started with your financial journey.',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'connect',
    title: 'Connect Your Accounts',
    description: 'Link your bank accounts, credit cards, and investments to get a complete view of your finances.',
    icon: Wallet,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    description: 'Define your financial goals - whether it\'s saving for a vacation, buying a home, or building an emergency fund.',
    icon: Target,
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights',
    description: 'Our AI analyzes your spending patterns and provides personalized recommendations to help you save more.',
    icon: TrendingUp,
    color: 'from-cyan-500 to-blue-600',
  },
];

interface OnboardingWalkthroughProps {
  onClose: () => void;
}

export default function OnboardingWalkthrough({ onClose }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="walkthrough"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg card-glass rounded-3xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-[var(--glass-bg)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
              />
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Skip Button */}
              <button
                onClick={handleSkip}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--glass-bg)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-text)]" />
              </button>

              {/* Icon */}
              <motion.div
                key={step.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className={cn(
                  'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-6',
                  step.color
                )}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Text */}
              <motion.div
                key={`${step.id}-text`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                <p className="text-[var(--muted-text)] text-lg">{step.description}</p>
              </motion.div>

              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all duration-300',
                      index === currentStep
                        ? 'bg-indigo-500 w-8'
                        : index < currentStep
                        ? 'bg-indigo-500/50'
                        : 'bg-[var(--glass-border)]'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--glass-border)] flex items-center justify-between bg-[var(--glass-bg)]">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                  currentStep === 0
                    ? 'text-[var(--muted-text)] cursor-not-allowed'
                    : 'text-[var(--foreground)] hover:bg-[var(--glass-bg)]'
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleNext}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium transition-all',
                  'bg-gradient-to-r hover:shadow-lg hover:scale-105',
                  step.color
                )}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md card-glass rounded-3xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-3">You're All Set!</h2>
            <p className="text-[var(--muted-text)]">
              Your financial journey starts now. Let's achieve your goals together!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
