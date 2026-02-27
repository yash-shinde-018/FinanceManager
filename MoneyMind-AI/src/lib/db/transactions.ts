import { createClient } from '@/lib/supabase/client';

export type TransactionRow = {
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
  occurred_at: string;
  created_at: string;
};

export async function listTransactions(limit = 100) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as TransactionRow[];
}

export async function createTransaction(input: {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  occurred_at: string;
  account_id?: string | null;
  payment_method?: string | null;
  merchant?: string | null;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: input.account_id ?? null,
      amount: input.amount,
      type: input.type,
      category: input.category,
      description: input.description,
      occurred_at: input.occurred_at,
      payment_method: input.payment_method ?? null,
      merchant: input.merchant ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as TransactionRow;
}

export async function searchTransactions(query: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .or(`description.ilike.%${query}%,category.ilike.%${query}%,merchant.ilike.%${query}%`)
    .order('occurred_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data ?? []) as TransactionRow[];
}
