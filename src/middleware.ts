import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  // Add the sign-in and sign-up pages to the list of public routes
  // so that users can access them without being logged in.
  publicRoutes: ['/sign-in', '/sign-up'],
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!.*\\..*|_next).*)',
    // Run middleware on all routes except static files
    '/',
    // Run middleware on API routes
    '/(api|trpc)(.*)',
  ],
};

