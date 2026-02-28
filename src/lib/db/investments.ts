import { createClient } from '@/lib/supabase/client';

export type AssetType = 'stocks' | 'etfs' | 'mutual_funds' | 'crypto' | 'fixed_deposits' | 'gold' | 'manual_assets';

export type InvestmentRow = {
  id: string;
  user_id: string;
  asset_type: AssetType;
  asset_name: string;
  symbol: string | null;
  quantity: number;
  buy_price: number;
  purchase_date: string;
  platform: string | null;
  current_price: number | null;
  last_price_update: string | null;
  created_at: string;
  updated_at: string;
};

export type InvestmentWithMetrics = InvestmentRow & {
  invested_amount: number;
  current_value: number;
  profit_loss: number;
  return_percentage: number;
};

export async function listInvestments(): Promise<InvestmentWithMetrics[]> {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const investments = (data ?? []) as InvestmentRow[];
  return calculateMetrics(investments);
}

export async function createInvestment(input: {
  asset_type: AssetType;
  asset_name: string;
  symbol?: string | null;
  quantity: number;
  buy_price: number;
  purchase_date: string;
  platform?: string | null;
  current_price?: number | null;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('investments')
    .insert({
      user_id: user.id,
      asset_type: input.asset_type,
      asset_name: input.asset_name,
      symbol: input.symbol ?? null,
      quantity: input.quantity,
      buy_price: input.buy_price,
      purchase_date: input.purchase_date,
      platform: input.platform ?? null,
      current_price: input.current_price ?? input.buy_price,
      last_price_update: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as InvestmentRow;
}

export async function updateInvestment(
  id: string,
  input: Partial<Omit<InvestmentRow, 'id' | 'user_id' | 'created_at'>>
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('investments')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as InvestmentRow;
}

export async function deleteInvestment(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updatePrices(investments: InvestmentRow[], priceMap: Record<string, number>) {
  const supabase = createClient();
  const now = new Date().toISOString();

  const updates = investments
    .filter(inv => inv.symbol && priceMap[inv.symbol])
    .map(inv => ({
      id: inv.id,
      current_price: priceMap[inv.symbol!],
      last_price_update: now,
      updated_at: now,
    }));

  if (updates.length === 0) return;

  const { error } = await supabase
    .from('investments')
    .upsert(updates);

  if (error) throw error;
}

export function calculateMetrics(investments: InvestmentRow[]): InvestmentWithMetrics[] {
  return investments.map(inv => {
    const invested_amount = inv.quantity * inv.buy_price;
    const current_price = inv.current_price ?? inv.buy_price;
    const current_value = inv.quantity * current_price;
    const profit_loss = current_value - invested_amount;
    const return_percentage = invested_amount > 0 ? (profit_loss / invested_amount) * 100 : 0;

    return {
      ...inv,
      invested_amount,
      current_value,
      profit_loss,
      return_percentage,
    };
  });
}

export function calculatePortfolioMetrics(investments: InvestmentWithMetrics[]) {
  const total_invested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0);
  const total_current_value = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const total_profit_loss = total_current_value - total_invested;
  const overall_return_percentage = total_invested > 0 ? (total_profit_loss / total_invested) * 100 : 0;

  // Asset allocation
  const allocation = investments.reduce((acc, inv) => {
    acc[inv.asset_type] = (acc[inv.asset_type] || 0) + inv.current_value;
    return acc;
  }, {} as Record<string, number>);

  // Risk calculation based on allocation
  let risk_score = 0;
  const totalValue = total_current_value || 1; // Avoid division by zero
  
  // High risk assets weight
  const cryptoWeight = (allocation['crypto'] || 0) / totalValue;
  const stockWeight = (allocation['stocks'] || 0) / totalValue;
  const etfWeight = (allocation['etfs'] || 0) / totalValue;
  const mutualFundWeight = (allocation['mutual_funds'] || 0) / totalValue;
  
  // Risk scoring (0-100)
  risk_score += cryptoWeight * 100; // Crypto is highest risk
  risk_score += stockWeight * 60;   // Stocks are medium-high risk
  risk_score += etfWeight * 40;     // ETFs are medium risk
  risk_score += mutualFundWeight * 30; // Mutual funds are medium-low risk
  
  // Cap at 100
  risk_score = Math.min(100, Math.round(risk_score));

  let risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  if (risk_score < 25) risk_level = 'low';
  else if (risk_score < 50) risk_level = 'moderate';
  else if (risk_score < 75) risk_level = 'high';
  else risk_level = 'very_high';

  return {
    total_invested,
    total_current_value,
    total_profit_loss,
    overall_return_percentage,
    allocation,
    risk_score,
    risk_level,
    asset_count: investments.length,
  };
}
