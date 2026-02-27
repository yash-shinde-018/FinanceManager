import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = SUPABASE_URL || '';
const supabaseAnonKey = SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  merchant: string | null;
  payment_method: string | null;
  status: string;
  is_anomaly: boolean;
  anomaly_reviewed: boolean;
  anomaly_notes: string | null;
  occurred_at: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'anomaly' | 'goal' | 'budget' | 'system' | 'transaction';
  is_read: boolean;
  data: any | null;
  created_at: string;
};

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  institution: string | null;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string | null;
  icon: string | null;
  color: string | null;
  status: string;
  created_at: string;
};

export type Investment = {
  id: string;
  user_id: string;
  asset_type: string;
  asset_name: string;
  symbol: string | null;
  quantity: number;
  buy_price: number;
  current_price: number | null;
  purchase_date: string;
  platform: string | null;
  created_at: string;
};
