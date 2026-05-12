import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || profile.status !== 'active') return null;
  return user;
}

// GET /api/users — list all user profiles (admin only)
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { data: users, error } = await createAdminClient()
      .from('user_profiles')
      .select('id, email, name, avatar_url, role, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ users: users ?? [] });
  } catch (err) {
    console.error('users GET error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// PATCH /api/users — update role or status (admin only)
export async function PATCH(req: NextRequest) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { id, role, status } = await req.json() as {
      id: string;
      role?: 'admin' | 'staff';
      status?: 'pending' | 'active' | 'deleted';
    };

    if (!id) return NextResponse.json({ error: 'User ID required.' }, { status: 400 });

    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (role)   updates.role   = role;
    if (status) updates.status = status;

    const { error } = await createAdminClient()
      .from('user_profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('users PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
