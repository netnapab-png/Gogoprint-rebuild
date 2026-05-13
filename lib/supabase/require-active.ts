import { getSessionProfile } from '@/lib/supabase/get-session-profile';

export async function requireActive() {
  const result = await getSessionProfile();
  return result?.user ?? null;
}
