import { createClient } from '@/lib/supabase/client';

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
};

export async function listNotifications(limit = 20) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Table likely doesn't exist - return empty array gracefully
      console.warn('Notifications table error:', error.message);
      return [];
    }
    return (data ?? []) as NotificationRow[];
  } catch (err) {
    console.warn('Failed to fetch notifications:', err);
    return [];
  }
}

export async function markNotificationRead(id: string) {
  const supabase = createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllNotificationsRead() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
}

export async function deleteNotificationRow(id: string) {
  const supabase = createClient();
  await supabase.from('notifications').delete().eq('id', id);
}

export async function seedWelcomeNotifications() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Check if user already has notifications
    const { data: existing, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (checkError) {
      console.warn('Could not check existing notifications:', checkError.message);
      return;
    }

    if (existing && existing.length > 0) {
      return; // User already has notifications, don't seed
    }

    // Create welcome notifications
    const welcomeNotifications = [
      {
        user_id: user.id,
        title: 'Welcome to MoneyMind AI!',
        message: 'Get started by exploring your dashboard and adding your first transaction. We are here to help you achieve your financial goals.',
        type: 'insight',
        is_read: false,
        link: '/dashboard/transactions',
      },
      {
        user_id: user.id,
        title: 'Set Up Your Financial Goals',
        message: 'Define your savings goals and let our AI help you track progress. Whether it is a vacation, emergency fund, or new gadget - we have got you covered.',
        type: 'goal',
        is_read: false,
        link: '/dashboard/goals',
      },
      {
        user_id: user.id,
        title: 'Link Your Bank Account',
        message: 'Connect your bank accounts for automatic transaction tracking. This helps our AI provide better insights and spending predictions.',
        type: 'alert',
        is_read: false,
        link: '/dashboard/accounts',
      },
    ];

    const { error } = await supabase.from('notifications').insert(welcomeNotifications);
    if (error) {
      console.warn('Failed to seed welcome notifications:', error.message);
    }
  } catch (err) {
    console.warn('Failed to seed notifications:', err);
  }
}
