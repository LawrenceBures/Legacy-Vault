import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/delivery(.*)',
  '/events(.*)',
  '/my-people(.*)',
  '/new-entry(.*)',
  '/onboarding(.*)',
  '/record(.*)',
  '/vault(.*)',
  '/api/dashboard(.*)',
  '/api/events(.*)',
  '/api/profile(.*)',
  '/api/vault(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
