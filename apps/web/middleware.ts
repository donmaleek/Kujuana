import { NextRequest, NextResponse } from 'next/server'

/**
 * Route groups:
 * (marketing)  -> public
 * (auth)       -> public
 * (onboarding) -> auth required
 * (dashboard)  -> auth
 * (admin)      -> auth + role admin/manager/matchmaker
 *
 * We gate using lightweight cookies set at login.
 * Cookie names:
 *  - kp_at: access/session marker (truthy means authenticated)
 *  - kp_role: user role
 *  - kp_pc: "1" if profile completed (used to guide default routing)
 */

const COOKIE_ACCESS = 'kp_at'
const COOKIE_ROLE = 'kp_role'
const COOKIE_PROFILE_COMPLETED = 'kp_pc'

const PUBLIC_PREFIXES = [
  '/',
  '/pricing',
  '/about',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
]
const AUTH_PREFIXES = ['/step', '/complete', '/dashboard', '/matches', '/profile', '/settings', '/subscription', '/admin']

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
}

function isAuthArea(pathname: string) {
  return AUTH_PREFIXES.some((p) => pathname.startsWith(p))
}

function isAdminArea(pathname: string) {
  return pathname.startsWith('/admin')
}

function isOnboardingArea(pathname: string) {
  return pathname.startsWith('/step') || pathname.startsWith('/complete')
}

function isDashboardArea(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/matches') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/subscription')
  )
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always ignore next internals & static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api') // allow Next API routes if any
  ) {
    return NextResponse.next()
  }

  const access = req.cookies.get(COOKIE_ACCESS)?.value
  const role = (req.cookies.get(COOKIE_ROLE)?.value || 'user') as 'user' | 'matchmaker' | 'manager' | 'admin'
  const profileCompleted = req.cookies.get(COOKIE_PROFILE_COMPLETED)?.value === '1'

  const isAuthed = Boolean(access)

  // If not auth area and public -> allow
  if (!isAuthArea(pathname) && isPublicPath(pathname)) return NextResponse.next()

  // If auth area but not authenticated -> redirect to login
  if (isAuthArea(pathname) && !isAuthed) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // If onboarding area: allow even if profile not complete
  if (isOnboardingArea(pathname)) return NextResponse.next()

  // For incomplete profiles, keep dashboard access but funnel to /profile first.
  if (isDashboardArea(pathname) && !profileCompleted && !pathname.startsWith('/profile')) {
    const url = req.nextUrl.clone()
    url.pathname = '/profile'
    return NextResponse.redirect(url)
  }

  // Admin requires role
  if (isAdminArea(pathname)) {
    const ok = role === 'admin' || role === 'manager' || role === 'matchmaker'
    if (!ok) {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
