'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OnboardingWalkthrough from '@/components/onboarding/OnboardingWalkthrough';
import SpendingAlerts from '@/components/dashboard/SpendingAlerts';
import FinanceChatbot from '@/components/dashboard/FinanceChatbot';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is new
    const isNewUser = localStorage.getItem('moneymind_onboarding');
    if (isNewUser === 'true' && pathname === '/dashboard') {
      setShowOnboarding(true);
      localStorage.removeItem('moneymind_onboarding');
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <motion.main
        initial={false}
        animate={{
          marginLeft: isCollapsed ? 80 : 280,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        <Header isCollapsed={isCollapsed} />

        <div className={cn(
          'p-6 transition-all duration-300',
          'pt-24' // Space for header
        )}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.main>

      {/* Onboarding Walkthrough */}
      {showOnboarding && (
        <OnboardingWalkthrough onClose={() => setShowOnboarding(false)} />
      )}

      {/* Spending Alerts */}
      <SpendingAlerts />

      {/* AI Finance Chatbot */}
      <FinanceChatbot />
    </div>
  );
}
