import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// --- FIX: Removed the homepage '/' from the public routes ---
// This ensures that the dashboard is a protected route and the user session is always available.
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    // Skip auth checks on explicitly public routes
    if (isPublicRoute(req)) return NextResponse.next();

    // Get the user ID from the session
    const { userId } = await auth();

    // If the user is not signed in, redirect them to the sign-in page
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Allow signed-in users to proceed
    return NextResponse.next();
  },
);

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // all non-static pages
    '/',
    '/(api|trpc)(.*)',
  ],
};
