import { createClient } from '@/lib/supabase/client';
import { mlClient } from '@/lib/ml/client';

export async function getDashboardOverview() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Total income and expense
  const { data: sums, error } = await supabase
    .from('transactions')
    .select('type, amount');

  if (error) throw error;

  let totalIncome = 0;
  let totalExpense = 0;

  (sums ?? []).forEach((t) => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    if (t.type === 'expense') totalExpense += Number(t.amount);
  });

  const totalBalance = totalIncome - totalExpense;

  // Last 30 days spending
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: recentSpending, error: recentError } = await supabase
    .from('transactions')
    .select('amount, type, occurred_at')
    .gte('occurred_at', since.toISOString());

  if (recentError) throw recentError;

  let monthlySpending = 0;
  (recentSpending ?? []).forEach((t) => {
    if (t.type === 'expense') monthlySpending += Number(t.amount);
  });

  // Get ML-powered forecast for next 30 days
  let predictedSpending = monthlySpending; // fallback
  try {
    const forecast = await mlClient.getForecast(30);
    if (forecast) {
      predictedSpending = Math.abs(forecast.total_predicted);
    }
  } catch (error) {
    console.error('Error getting ML forecast:', error);
  }

  // Count anomaly alerts from recent transactions
  let anomalyAlerts = 0;
  const { data: anomalies } = await supabase
    .from('transactions')
    .select('is_anomaly')
    .eq('is_anomaly', true)
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
  };
}

export async function getRecentTransactions(limit = 8) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

// Get spending trends for the last 6 months
export async function getSpendingTrends(months = 6) {
  const supabase = createClient();

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, occurred_at')
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

  const since = new Date();
  since.setDate(1); // Start of current month

  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount, type')
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

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, occurred_at')
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
