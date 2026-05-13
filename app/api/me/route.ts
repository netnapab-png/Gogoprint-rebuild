import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: profile } = await createAdminClient()
      .from('user_profiles')
      .select('id, name, email, role, status, avatar_url, countries')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    return NextResponse.json({ user: profile });
  } catch (err) {
    console.error('me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
