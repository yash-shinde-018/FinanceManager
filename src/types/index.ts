export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  financialHealthScore: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  merchant?: string;
  isAnomaly?: boolean;
}

export interface Account {
  id: string;
  userId: string;
  type: 'bank' | 'card' | 'investment';
  name: string;
  institution: string;
  balance: number;
  currency: string;
  lastSync: Date;
  status: 'active' | 'inactive' | 'error';
  accountNumber?: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  icon: string;
  color: string;
  status: 'active' | 'completed' | 'paused';
}

export interface AIInsight {
  id: string;
  type: 'savings' | 'overspending' | 'anomaly' | 'forecast' | 'tip';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'alert';
  timestamp: Date;
  actionRequired?: boolean;
  actionText?: string;
  relatedData?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'transaction' | 'insight' | 'goal' | 'alert' | 'system';
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

export interface SpendingData {
  date: string;
  amount: number;
  income?: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface WeeklyData {
  day: string;
  amount: number;
}

export interface ForecastData {
  date: string;
  predicted: number;
  confidence: [number, number];
  actual?: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  completed: boolean;
}
