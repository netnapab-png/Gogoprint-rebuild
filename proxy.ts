import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — keeps the JWT alive
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Routes that don't require any auth check
  const isPublic =
    pathname === '/login' ||
    pathname === '/pending' ||
    pathname === '/no-access' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico';

  // Skip API routes — they carry their own auth checks
  const isApiRoute = pathname.startsWith('/api/');

  // Unauthenticated → login
  if (!user && !isPublic && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Authenticated + hitting login page → dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Authenticated + protected page → check profile
  if (user && !isPublic && !isApiRoute) {
    // Use service role key to bypass RLS — anon+JWT client does not reliably
    // forward the JWT to PostgREST queries in the middleware context.
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    // Status checks
    if (profile?.status === 'pending') {
      if (pathname !== '/pending') return NextResponse.redirect(new URL('/pending', request.url));
      return supabaseResponse;
    }

    if (profile?.status === 'deleted') {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role check — all app pages require admin
    if (profile?.role !== 'admin') {
      if (pathname !== '/no-access') {
        return NextResponse.redirect(new URL('/no-access', request.url));
      }
      return supabaseResponse;
    }

    // Admin on the no-access page → bounce to dashboard
    if (pathname === '/no-access') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
