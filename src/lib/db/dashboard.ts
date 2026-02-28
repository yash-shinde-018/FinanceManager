import { createClient } from '@/lib/supabase/client';
import { mlClient, formatTransactionForML } from '@/lib/ml/client';
import type { MLTransaction } from '@/lib/ml/client';

export interface DashboardOverview {
  totalBalance: number;
  monthlySpending: number;
  predictedSpending: number;
  savingsRate: number;
  balanceChange: number;
  spendingChange: number;
  anomalyAlerts: number;
  forecastStatus?: 'ok' | 'early_stage' | 'insufficient_data';
  forecastModelUsed?: string;
  daysOfData?: number;
  minDaysRequired?: number;
  fullModelDays?: number;
}

export async function getDashboardOverview() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Get actual account balances for this user
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (accountsError) throw accountsError;

  const totalBalance = accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;

  // Get transactions for this user only
  const { data: sums, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('user_id', user.id);

  if (error) throw error;

  let totalIncome = 0;
  let totalExpense = 0;

  (sums ?? []).forEach((t) => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    if (t.type === 'expense') totalExpense += Number(t.amount);
  });

  // Last 30 days spending
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: recentSpending, error: recentError } = await supabase
    .from('transactions')
    .select('amount, type, occurred_at')
    .eq('user_id', user.id)
    .gte('occurred_at', since.toISOString());

  if (recentError) throw recentError;

  let monthlySpending = 0;
  (recentSpending ?? []).forEach((t) => {
    if (t.type === 'expense') monthlySpending += Number(t.amount);
  });

  // If seeded/demo data is old, the last-30-days window might be empty.
  // Fall back to the most recent 30 days relative to the latest transaction.
  if ((recentSpending?.length ?? 0) === 0) {
    const { data: latestRow, error: latestError } = await supabase
      .from('transactions')
      .select('occurred_at')
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestError && latestRow?.occurred_at) {
      const latestDate = new Date(latestRow.occurred_at);
      const fallbackSince = new Date(latestDate);
      fallbackSince.setDate(fallbackSince.getDate() - 30);

      const { data: fallbackSpending, error: fallbackError } = await supabase
        .from('transactions')
        .select('amount, type, occurred_at')
        .eq('user_id', user.id)
        .gte('occurred_at', fallbackSince.toISOString())
        .lte('occurred_at', latestDate.toISOString());

      if (!fallbackError) {
        monthlySpending = 0;
        (fallbackSpending ?? []).forEach((t) => {
          if (t.type === 'expense') monthlySpending += Number(t.amount);
        });
      }
    }
  }

  // Get ML-powered forecast for next month (only if user has 12+ months of data)
  let predictedSpending = 0; // Don't show monthly spending as fallback
  let forecastStatus: DashboardOverview['forecastStatus'] = 'insufficient_data';
  let forecastModelUsed = 'No Data';
  let daysOfData = 0;
  
  // Check if user has transactions spanning 12+ months
  const { data: dateRange, error: dateError } = await supabase
    .from('transactions')
    .select('occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  
  console.log('Dashboard: First transaction query result:', { dateRange, dateError, userId: user.id });
  if (dateError) {
    console.error('Dashboard: Failed to fetch first transaction date:', dateError);
  }
  
  const firstTransactionDate = dateRange?.occurred_at ? new Date(dateRange.occurred_at) : null;
  const now = new Date();
  const monthsDiff = firstTransactionDate 
    ? (now.getFullYear() - firstTransactionDate.getFullYear()) * 12 + (now.getMonth() - firstTransactionDate.getMonth())
    : 0;
  
  console.log('Dashboard: Date analysis:', { firstTransactionDate, monthsDiff, now });
  
  // Need at least 12 months of data for prediction
  if (monthsDiff >= 11) {
    try {
      // Aggregate transactions by month for ML API
      const { data: allTransactions, error: transError } = await supabase
        .from('transactions')
        .select('occurred_at, amount, type, category')
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: true });
      
      console.log('Dashboard: All transactions query:', { count: allTransactions?.length, error: transError });
      if (transError) {
        console.error('Dashboard: Failed to fetch transactions for prediction:', transError);
      }
      daysOfData = allTransactions?.length || 0;
      
      // Group by month and calculate totals
      const monthlyMap = new Map<string, {
        date: string;
        total_expense: number;
        total_income: number;
        expense_food: number;
        expense_travel: number;
        expense_bills: number;
        expense_emi: number;
        expense_shopping: number;
        expense_investment: number;
        expense_healthcare: number;
        expense_entertainment: number;
        expense_subscription: number;
        expense_transfer: number;
        expense_others: number;
      }>();
      
      (allTransactions || []).forEach((t) => {
        const date = new Date(t.occurred_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            date: monthKey,
            total_expense: 0,
            total_income: 0,
            expense_food: 0,
            expense_travel: 0,
            expense_bills: 0,
            expense_emi: 0,
            expense_shopping: 0,
            expense_investment: 0,
            expense_healthcare: 0,
            expense_entertainment: 0,
            expense_subscription: 0,
            expense_transfer: 0,
            expense_others: 0,
          });
        }
        
        const month = monthlyMap.get(monthKey)!;
        const amount = Number(t.amount);
        
        if (t.type === 'expense') {
          month.total_expense += amount;
          
          // Categorize expenses
          const category = (t.category || '').toLowerCase();
          if (category.includes('food')) month.expense_food += amount;
          else if (category.includes('travel') || category.includes('transport')) month.expense_travel += amount;
          else if (category.includes('bill') || category.includes('utility')) month.expense_bills += amount;
          else if (category.includes('emi') || category.includes('loan')) month.expense_emi += amount;
          else if (category.includes('shop')) month.expense_shopping += amount;
          else if (category.includes('invest')) month.expense_investment += amount;
          else if (category.includes('health') || category.includes('medical')) month.expense_healthcare += amount;
          else if (category.includes('entertainment') || category.includes('movie')) month.expense_entertainment += amount;
          else if (category.includes('subscription')) month.expense_subscription += amount;
          else if (category.includes('transfer')) month.expense_transfer += amount;
          else month.expense_others += amount;
        } else {
          month.total_income += amount;
        }
      });
      
      const monthlyData = Array.from(monthlyMap.values());
      const avgMonthlyExpense = monthlyData.length
        ? monthlyData.reduce((sum, m) => sum + (Number(m.total_expense) || 0), 0) / monthlyData.length
        : 0;
      
      // Call ML API with aggregated monthly data
      if (monthlyData.length >= 12) {
        console.log('Dashboard: Calling predictSpending with', monthlyData.length, 'months');
        const forecast = await mlClient.predictSpending(monthlyData);
        
        if (forecast) {
          console.log('Dashboard: Prediction result:', forecast);
          const rawPrediction =
            (forecast as any)?.prediction ??
            (forecast as any)?.predicted_expense ??
            (forecast as any)?.predictedExpense;
          console.log('Dashboard: Raw prediction:', rawPrediction, 'Type:', typeof rawPrediction);
          forecastStatus = 'ok';
          forecastModelUsed = forecast.model_used || 'Unknown';
          
          // Use prediction - handle both positive and negative values
          // Convert to positive number if it's a valid prediction
          const predValue = Math.abs(Number(rawPrediction));
          console.log('Dashboard: Parsed prediction value:', predValue);
          console.log('Dashboard: avgMonthlyExpense:', avgMonthlyExpense);

          let normalizedPredValue = predValue;

          // Heuristic: some model deployments return values in paise (x100).
          // If prediction is wildly larger than historical monthly expenses, scale it down.
          if (
            Number.isFinite(avgMonthlyExpense) &&
            avgMonthlyExpense > 0 &&
            Number.isFinite(predValue) &&
            predValue > avgMonthlyExpense * 20
          ) {
            normalizedPredValue = predValue / 100;
            console.warn('Dashboard: Prediction looks inflated; scaling down by 100', {
              predValue,
              normalizedPredValue,
              avgMonthlyExpense,
            });
          }

          if (Number.isFinite(normalizedPredValue) && normalizedPredValue > 0) {
            predictedSpending = normalizedPredValue;
            console.log('Dashboard: Setting predictedSpending to:', predictedSpending);
          } else {
            console.warn('Dashboard: Prediction invalid (raw/parsed):', rawPrediction, predValue);
          }
        } else {
          console.log('Dashboard: predictSpending returned null');
          forecastStatus = 'insufficient_data';
          forecastModelUsed = 'Prediction unavailable';
        }
      } else {
        forecastStatus = 'insufficient_data';
        forecastModelUsed = `Need 12+ months, have ${monthlyData.length}`;
      }
    } catch (error) {
      console.error('Error getting ML forecast:', error);
      forecastStatus = 'insufficient_data';
      forecastModelUsed = 'Prediction failed';
    }
  } else {
    forecastStatus = 'insufficient_data';
    forecastModelUsed = `Need 12+ months, have ${monthsDiff + 1}`;
  }

  // Count anomaly alerts from recent transactions
  let anomalyAlerts = 0;
  const { data: anomalies } = await supabase
    .from('transactions')
    .select('is_anomaly')
    .eq('is_anomaly', true)
    .eq('user_id', user.id)
    .gte('occurred_at', since.toISOString());

  anomalyAlerts = anomalies?.length || 0;

  return {
    totalBalance,
    monthlySpending,
    predictedSpending,
    savingsRate: totalIncome ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    balanceChange: 0,
    spendingChange: 0,
    anomalyAlerts,
    forecastStatus,
    forecastModelUsed,
    daysOfData,
    minDaysRequired: 14,
    fullModelDays: 21,
  };
}

export async function getRecentTransactions(limit = 8) {
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
  return data ?? [];
}

// Get spending trends for the last 6 months
export async function getSpendingTrends(months = 6) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, occurred_at')
    .eq('user_id', user.id)
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: true });

  if (error) throw error;

  // Group by month
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize last N months with 0
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = monthNames[d.getMonth()];
    monthlyData[key] = { income: 0, expense: 0 };
  }

  (data ?? []).forEach((t) => {
    const date = new Date(t.occurred_at);
    const month = monthNames[date.getMonth()];
    if (monthlyData[month]) {
      if (t.type === 'income') monthlyData[month].income += Number(t.amount);
      if (t.type === 'expense') monthlyData[month].expense += Number(t.amount);
    }
  });

  return Object.entries(monthlyData).map(([month, values]) => ({
    month,
    income: values.income,
    expense: values.expense,
  }));
}

// Get spending by category for current month
export async function getSpendingByCategory() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const since = new Date();
  since.setDate(1); // Start of current month

  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount, type')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('occurred_at', since.toISOString());

  if (error) throw error;

  const categoryTotals: Record<string, number> = {};
  (data ?? []).forEach((t) => {
    const cat = t.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
  });

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

// Get weekly breakdown (last 7 days)
export async function getWeeklyBreakdown() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, occurred_at')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: true });

  if (error) throw error;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData: Record<string, number> = {};

  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = dayNames[d.getDay()];
    weeklyData[day] = 0;
  }

  (data ?? []).forEach((t) => {
    const date = new Date(t.occurred_at);
    const day = dayNames[date.getDay()];
    if (weeklyData[day] !== undefined) {
      weeklyData[day] += Number(t.amount);
    }
  });

  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return dayOrder.map(day => ({
    day,
    amount: weeklyData[day] || 0,
  }));
}
