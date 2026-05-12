import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

const BOOTSTRAP_ADMIN_EMAIL = 'netnapa.b@prepared.asia';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const userId = data.user.id;
      const userEmail = data.user.email ?? '';

      // Use service role key for profile updates — bypasses RLS
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );

      // Bootstrap admin: if this is the designated first-admin email,
      // ensure their profile is active + admin regardless of current state.
      if (userEmail === BOOTSTRAP_ADMIN_EMAIL) {
        await adminClient
          .from('user_profiles')
          .update({ status: 'active', role: 'admin', last_login_at: new Date().toISOString() })
          .eq('id', userId);
      } else {
        // Track last login for all other users
        await adminClient
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', userId);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
