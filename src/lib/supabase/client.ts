import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createBrowserClient(url, anonKey, {
    auth: {
      // Avoid "Acquiring an exclusive Navigator LockManager lock ... timed out" in dev
      // and in environments where multiple tabs/refreshes contend on the lock.
      lock: async (name, acquireTimeout, fn) => fn(),
    },
  });
}
