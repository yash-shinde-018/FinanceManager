'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Wallet, PlusCircle, PiggyBank, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MoneyMind AI!',
    description: 'Your personal AI-powered financial companion. Let\'s get you started with a quick tour.',
    icon: <PiggyBank className="w-12 h-12 text-emerald-400" />,
  },
  {
    id: 'accounts',
    title: 'Add Your Accounts',
    description: 'First, you need to add your bank accounts, credit cards, or cash wallets. This helps track your balances accurately.',
    icon: <Wallet className="w-12 h-12 text-indigo-400" />,
    action: 'Go to Accounts Page',
  },
  {
    id: 'balance',
    title: 'Add Initial Balance',
    description: 'Select your account type (Bank, Credit Card, Cash, etc.) and add your current balance. This is required before making transactions.',
    icon: <PlusCircle className="w-12 h-12 text-amber-400" />,
    action: 'Add Balance',
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Once you have balance in your accounts, you can start tracking expenses and income. If balance reaches 0, you\'ll need to add income first.',
    icon: <ArrowRight className="w-12 h-12 text-purple-400" />,
  },
];

export default function OnboardingTour() {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    checkIfNewUser();
  }, []);

  const checkIfNewUser = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Check if user has any accounts
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (error) {
      console.error('Error checking accounts:', error);
      return;
    }

    // Show tour if no accounts exist (new user)
    if (!accounts || accounts.length === 0) {
      setIsNewUser(true);
      setShowTour(true);
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setShowTour(false);
    // Save to localStorage so tour doesn't show again
    localStorage.setItem('onboarding_completed', 'true');
  };

  const handleAction = () => {
    const step = tourSteps[currentStep];
    if (step.id === 'accounts' || step.id === 'balance') {
      window.location.href = '/dashboard/accounts';
    }
    handleClose();
  };

  const skipTour = () => {
    setShowTour(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  if (!showTour) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-[#1a1a2e] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header with skip button */}
          <div className="p-4 flex items-center justify-between border-b border-[var(--glass-border)]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-text)]">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button
              onClick={skipTour}
              className="text-xs text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
            >
              Skip tour <X className="w-3 h-3" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-[var(--glass-bg)] flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{step.title}</h2>
              <p className="text-[var(--muted-text)] text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 px-6 pb-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-indigo-500' : 'bg-[var(--glass-bg)]'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--glass-border)] flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`flex items-center gap-1 text-sm ${
                isFirstStep
                  ? 'text-[var(--muted-text)] cursor-not-allowed'
                  : 'text-[var(--foreground)] hover:text-indigo-400'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {step.action && (
                <button
                  onClick={handleAction}
                  className="px-4 py-2 text-sm bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                >
                  {step.action}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
