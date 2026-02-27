import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Transaction Supabase (for storing UPI transaction history)
const transactionSupabaseUrl = process.env.EXPO_PUBLIC_TRANSACTION_SUPABASE_URL || '';
const transactionSupabaseKey = process.env.EXPO_PUBLIC_TRANSACTION_SUPABASE_ANON_KEY || '';

export const transactionSupabase = createClient(transactionSupabaseUrl, transactionSupabaseKey);

// Type for UPI Transactions
export interface UpiTransaction {
  id: string;
  user_id: string;
  upi_id: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  description?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}
