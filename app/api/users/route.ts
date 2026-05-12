import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

async function requireAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
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
    const supabase = await createClient();
    if (!await requireAdmin(supabase)) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { data: users, error } = await supabase
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
    const supabase = await createClient();
    if (!await requireAdmin(supabase)) {
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

    const { error } = await supabase
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
