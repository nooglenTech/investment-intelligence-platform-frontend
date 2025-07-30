import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public pages you want reachable without a session
const isPublicRoute = createRouteMatcher([
  '/',                 // homepage
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(
  // ⬇️ make the handler async so we can await auth()
  async (auth, req) => {
    // Skip auth checks on public routes
    if (isPublicRoute(req)) return NextResponse.next();

    // auth() is async in v6+
    const { userId } = await auth();

    // Redirect unauthenticated users to sign‑in
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Everything okay – continue
    return NextResponse.next();
  },
);

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // all non‑static pages
    '/',
    '/(api|trpc)(.*)',
  ],
};
