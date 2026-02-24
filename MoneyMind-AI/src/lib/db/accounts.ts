import { createClient } from '@/lib/supabase/client';

export type AccountRow = {
  id: string;
  user_id: string;
  type: 'bank' | 'card' | 'investment';
  name: string;
  institution: string | null;
  balance: number;
  currency: string;
  account_number: string | null;
  status: string;
  last_sync: string | null;
  created_at: string;
};

export async function listAccounts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AccountRow[];
}
