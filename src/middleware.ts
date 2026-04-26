import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware({
  locales: ['en', 'fr', 'rw'],
  defaultLocale: 'en',
});

// Routes that require authentication (any logged-in user)
const AUTH_REQUIRED_PATTERNS = [
  /^\/[a-z]{2}\/checkout/,
  /^\/[a-z]{2}\/orders/,
  /^\/[a-z]{2}\/profile/,
];

// Routes that require staff/manager/admin access
const STAFF_REQUIRED_PATTERNS = [
  /^\/[a-z]{2}\/branch-dashboard/,
  /^\/[a-z]{2}\/admin/,
];

// Routes that require admin access only
const ADMIN_REQUIRED_PATTERNS = [
  /^\/[a-z]{2}\/admin\/users/,
  /^\/[a-z]{2}\/admin\/settings/,
];

// Auth pages — redirect to home if already logged in
const AUTH_PAGE_PATTERNS = [
  /^\/[a-z]{2}\/auth\/login/,
  /^\/[a-z]{2}\/auth\/register/,
  /^\/[a-z]{2}\/admin\/login/,
];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run intl middleware first to get locale-aware response
  let response: NextResponse;
  try {
    response = intlMiddleware(request) as NextResponse;
  } catch {
    response = NextResponse.next();
  }

  // Skip auth checks for static files, API routes, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // Build Supabase client for session check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        // Copy cookies to response
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session
  let user = null;
  let userRole: string = 'customer';

  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      // Fetch role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      userRole = profile?.role ?? 'customer';
    }
  } catch {
    // Session check failed — treat as unauthenticated
  }

  // Extract locale from pathname (e.g., /en, /fr, /rw)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch?.[1] ?? 'en';

  // ── Redirect logged-in users away from auth pages ──────────
  if (user && AUTH_PAGE_PATTERNS.some(p => p.test(pathname))) {
    // Staff/admin go to dashboard, customers go to home
    const isStaffOrAbove = ['staff', 'manager', 'admin'].includes(userRole);
    const destination = isStaffOrAbove
      ? `/${locale}/branch-dashboard`
      : `/${locale}`;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ── Protect customer-auth-required routes ──────────────────
  if (AUTH_REQUIRED_PATTERNS.some(p => p.test(pathname))) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Protect staff-required routes ──────────────────────────
  if (STAFF_REQUIRED_PATTERNS.some(p => p.test(pathname))) {
    if (!user) {
      // Not logged in — send to admin login
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isStaffOrAbove = ['staff', 'manager', 'admin'].includes(userRole);
    if (!isStaffOrAbove) {
      // Logged in but not staff — send to unauthorized page
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
    }
  }

  // ── Protect admin-only routes ───────────────────────────────
  if (ADMIN_REQUIRED_PATTERNS.some(p => p.test(pathname))) {
    if (!user || userRole !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
