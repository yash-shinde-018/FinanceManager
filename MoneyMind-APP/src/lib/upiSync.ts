/**
 * UPI Sync Service for MoneyMind - SIMPLIFIED DEBUG VERSION
 * Monitors balance changes and syncs UPI transactions directly from UPI Supabase
 */

import { supabase, upiSupabase } from './supabase';
import { mlClient } from './ml';

export type UpiTransaction = {
  id: string;
  user_id: string;
  upi_id: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending' | 'failed';
  description: string | null;
  note: string | null;
  created_at: string;
};

export type SyncResult = {
  synced: number;
  uncategorized: number;
  untracked: number;
  matched: string[];
  errors: string[];
};

/**
 * Fetch UPI transactions directly from UPI Supabase
 */
export async function fetchUpiTransactions(
  userId: string,
  since?: string,
  limit: number = 50
): Promise<UpiTransaction[]> {
  console.log(`[UPI SYNC] Fetching UPI transactions for user ${userId}`);
  console.log(`[UPI SYNC] UPI Supabase configured: ${!!upiSupabase}`);
  
  if (!upiSupabase) {
    console.error('[UPI SYNC] ERROR: UPI Supabase not configured!');
    return [];
  }

  try {
    let query = upiSupabase
      .from('upi_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[UPI SYNC] ERROR fetching UPI transactions:', error.message);
      return [];
    }

    console.log(`[UPI SYNC] Found ${data?.length || 0} UPI transactions`);
    
    if (data && data.length > 0) {
      console.log(`[UPI SYNC] Latest:`, data[0].amount, data[0].type, data[0].note);
    }

    return data || [];
  } catch (error) {
    console.error('[UPI SYNC] EXCEPTION:', error);
    return [];
  }
}

/**
 * Get current total balance for user
 */
export async function getTotalBalance(userId: string): Promise<number> {
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .eq('status', 'active');
  
  return accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;
}

/**
 * Simple sync - just fetch and insert latest UPI transactions
 */
export async function syncLatestTransactions(
  userId: string,
  accountId: string,
  limit: number = 10
): Promise<SyncResult> {
  console.log(`[UPI SYNC] === SYNC START ===`);
  
  const result: SyncResult = {
    synced: 0,
    uncategorized: 0,
    untracked: 0,
    matched: [],
    errors: [],
  };

  try {
    // 1. Get already synced UPI IDs
    const { data: existing } = await supabase
      .from('transactions')
      .select('upi_transaction_id')
      .eq('user_id', userId)
      .not('upi_transaction_id', 'is', null);

    const syncedIds = new Set(existing?.map(t => t.upi_transaction_id) || []);
    console.log(`[UPI SYNC] Already synced: ${syncedIds.size}`);

    // 2. Fetch latest UPI transactions
    const upiTransactions = await fetchUpiTransactions(userId, undefined, limit);
    
    // 3. Find unsynced transactions
    const unsynced = upiTransactions.filter(tx => !syncedIds.has(tx.id));
    console.log(`[UPI SYNC] Unsynced transactions: ${unsynced.length}`);

    // 4. Insert each unsynced transaction
    for (const upiTx of unsynced) {
      try {
        const type = upiTx.type === 'credit' ? 'income' : 'expense';
        const note = upiTx.note || upiTx.description || '';
        
        // Simple categorization
        let category = 'Others';
        const text = note.toLowerCase();
        if (text.includes('food') || text.includes('restaurant')) category = 'Food';
        else if (text.includes('uber') || text.includes('bus') || text.includes('travel')) category = 'Travel';
        else if (text.includes('bill')) category = 'Bills';
        else if (text.includes('shopping')) category = 'Shopping';
        
        const { error: insertError } = await supabase.from('transactions').insert({
          user_id: userId,
          account_id: accountId,
          amount: upiTx.amount,
          type,
          category,
          description: note || `${type === 'income' ? 'Received' : 'Paid'} via UPI`,
          merchant: upiTx.upi_id,
          payment_method: 'UPI',
          status: 'completed',
          is_anomaly: false,
          upi_transaction_id: upiTx.id,
          upi_synced_at: new Date().toISOString(),
          needs_categorization_review: false,
          occurred_at: upiTx.created_at,
        });

        if (insertError) {
          console.error(`[UPI SYNC] Insert error:`, insertError.message);
          result.errors.push(insertError.message);
        } else {
          console.log(`[UPI SYNC] Inserted: ${upiTx.id} - ${upiTx.amount}`);
          result.synced++;
          result.matched.push(upiTx.id);
        }
      } catch (err) {
        console.error(`[UPI SYNC] Error processing ${upiTx.id}:`, err);
        result.errors.push(String(err));
      }
    }

  } catch (error) {
    console.error('[UPI SYNC] Sync error:', error);
    result.errors.push(String(error));
  }

  console.log(`[UPI SYNC] === SYNC COMPLETE ===`, result);
  return result;
}

/**
 * Simple balance-based sync (for when balance changes)
 */
export async function syncUpiTransactions(
  userId: string,
  accountId: string,
  balanceChange: {
    changeAmount: number;
    changeType: 'income' | 'expense';
  }
): Promise<SyncResult> {
  console.log(`[UPI SYNC] Balance change: ${balanceChange.changeAmount} ${balanceChange.changeType}`);
  
  // For now, just sync latest transactions
  return syncLatestTransactions(userId, accountId, 20);
}

/**
 * Get uncategorized transactions
 */
export async function getUncategorizedTransactions(userId: string, limit: number = 20): Promise<any[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('needs_categorization_review', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[UPI SYNC] Error:', error);
    return [];
  }

  return data || [];
}

/**
 * Update transaction category
 */
export async function updateTransactionCategory(
  transactionId: string,
  category: string,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        category,
        needs_categorization_review: false,
        user_category_notes: notes || null,
        categorized_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    return !error;
  } catch (error) {
    console.error('[UPI SYNC] Error:', error);
    return false;
  }
}
