import { withAuth } from 'next-auth/middleware';

// Protect every route except the login page and NextAuth API callbacks.
export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon\\.ico).*)',
  ],
};
