import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface SessionProfile {
  id: string;
  role: 'admin' | 'user';
  status: string;
  countries: string[];
}

export interface SessionResult {
  user: { id: string; email?: string };
  profile: SessionProfile;
}

export async function getSessionProfile(): Promise<SessionResult | null> {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;

  const { data: profile } = await createAdminClient()
    .from('user_profiles')
    .select('id, role, status, countries')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status !== 'active') return null;
  return { user, profile };
}

// Admins with no countries assigned fall back to all countries (migration safety).
export function resolveCountries(profile: SessionProfile, allCountries: string[]): string[] {
  if (profile.countries.length > 0) return profile.countries;
  if (profile.role === 'admin') return allCountries;
  return [];
}
