import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that should be protected
const isProtectedRoute = createRouteMatcher([
  '/', // Protect the dashboard
  '/upload', // Protect the upload page
  '/deals(.*)', // Protect all deal detail pages
]);

export default clerkMiddleware((auth, req) => {
  // If the route is a protected route, enforce authentication.
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};