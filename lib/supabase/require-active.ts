import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function requireActive() {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;

  const { data: profile } = await createAdminClient()
    .from('user_profiles')
    .select('status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status !== 'active') return null;
  return user;
}
