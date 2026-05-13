import { getSessionProfile } from '@/lib/supabase/get-session-profile';

export async function requireAdmin() {
  const result = await getSessionProfile();
  if (!result || result.profile.role !== 'admin') return null;
  return result.user;
}
