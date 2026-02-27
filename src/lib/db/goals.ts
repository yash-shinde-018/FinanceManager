import { createClient } from '@/lib/supabase/client';

export type GoalRow = {
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

export async function listGoals() {
  const supabase = createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as GoalRow[];
}

export async function createGoal(
  name: string,
  targetAmount: number,
  deadline: string,
  category: string = 'Goal',
  icon: string = 'shield',
  color: string = '#6366f1'
) {
  const supabase = createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      name,
      target_amount: targetAmount,
      current_amount: 0,
      deadline,
      category,
      icon,
      color,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return data as GoalRow;
}

export async function updateGoal(
  goalId: string,
  updates: {
    name?: string;
    target_amount?: number;
    deadline?: string;
    category?: string;
    icon?: string;
    color?: string;
    status?: string;
  }
) {
  const supabase = createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as GoalRow;
}

export async function deleteGoal(goalId: string) {
  const supabase = createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function addFundsToGoal(goalId: string, amount: number) {
  const supabase = createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, get the current goal
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('current_amount, target_amount')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!goal) throw new Error('Goal not found');

  // Calculate new amount
  const newAmount = goal.current_amount + amount;
  const isCompleted = newAmount >= goal.target_amount;

  // Update the goal
  const { data, error } = await supabase
    .from('goals')
    .update({
      current_amount: newAmount,
      status: isCompleted ? 'completed' : 'active',
    })
    .eq('id', goalId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as GoalRow;
}

export async function withdrawFundsFromGoal(goalId: string, amount: number) {
  const supabase = createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, get the current goal
  const { data: goal, error: fetchError } = await supabase
    .from('goals')
    .select('current_amount')
    .eq('id', goalId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!goal) throw new Error('Goal not found');

  // Calculate new amount (can't go below 0)
  const newAmount = Math.max(0, goal.current_amount - amount);

  // Update the goal
  const { data, error } = await supabase
    .from('goals')
    .update({
      current_amount: newAmount,
      status: 'active', // Reset to active if withdrawing
    })
    .eq('id', goalId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as GoalRow;
}
