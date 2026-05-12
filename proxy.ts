import { createServerClient } from '@supabase/ssr';
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

  const isPublic =
    pathname === '/login' ||
    pathname === '/pending' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico';

  // Unauthenticated → login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in and hitting login page → dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Authenticated — check profile status & role
  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.status === 'pending') {
      if (pathname !== '/pending') {
        return NextResponse.redirect(new URL('/pending', request.url));
      }
      return supabaseResponse;
    }

    if (profile.status === 'deleted') {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin-only routes
    const adminOnly = ['/admin/import', '/admin/users'];
    if (adminOnly.some((r) => pathname.startsWith(r)) && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
