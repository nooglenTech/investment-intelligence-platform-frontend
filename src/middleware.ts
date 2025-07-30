// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// ✅ Define which routes are public (no login needed)
const isPublicRoute = createRouteMatcher([
  '/',                      // homepage
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhook(.*)',       // allow backend-only routes if needed
]);

// ✅ Use Clerk's v5 middleware handler
export default clerkMiddleware((auth, req) => {
  // if it's a public route, skip auth entirely
  if (isPublicRoute(req)) return;

  const { userId } = auth();
  // if it's a protected route and user is not logged in, Clerk will auto-redirect
  if (!userId) {
    // Optionally do custom redirect here, but usually not needed
  }
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // match all routes except static files
    '/',
    '/(api|trpc)(.*)',        // optionally match backend routes
  ],
};
