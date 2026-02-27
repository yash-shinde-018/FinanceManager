import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Environment variables from .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Primary Supabase client (for auth and balance)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Transaction Supabase client (for transaction history - keys to be provided later)
const transactionSupabaseUrl = process.env.EXPO_PUBLIC_TRANSACTION_SUPABASE_URL || '';
const transactionSupabaseKey = process.env.EXPO_PUBLIC_TRANSACTION_SUPABASE_ANON_KEY || '';

export const transactionSupabase = transactionSupabaseUrl && transactionSupabaseKey
  ? createClient(transactionSupabaseUrl, transactionSupabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Types
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

export type UpiTransaction = {
  id: string;
  user_id: string;
  upi_id: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  description: string | null;
  created_at: string;
};
