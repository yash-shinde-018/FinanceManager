import { createClient } from '@/lib/supabase/client';

export async function ensureProfile() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return;

  const payload = {
    id: user.id,
    email: user.email ?? null,
    name: (user.user_metadata?.name as string) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    updated_at: new Date().toISOString(),
  };

  await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
}
