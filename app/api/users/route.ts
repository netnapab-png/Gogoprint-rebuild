import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/require-admin';

// GET /api/users — list all user profiles (admin only)
export async function GET() {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { data: users, error } = await createAdminClient()
      .from('user_profiles')
      .select('id, email, name, avatar_url, role, status, created_at, last_login_at')
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
      role?: 'admin' | 'user';
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
