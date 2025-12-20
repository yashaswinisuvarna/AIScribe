import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// protect everything under /dashboard. We'll exclude /dashboard/settings explicitly in the handler
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // req.nextUrl is available in Edge middleware; fall back to pathname parsing if needed
  const pathname = req?.nextUrl?.pathname || new URL(req.url).pathname;

  // Exclude settings path (and any children) from protection so UserProfile can mount there
  if (pathname.startsWith('/dashboard/settings')) return;

  if (isProtectedRoute(req)) auth().protect();
});
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};