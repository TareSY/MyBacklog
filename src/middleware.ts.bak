import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard') ||
        req.nextUrl.pathname.startsWith('/lists') ||
        req.nextUrl.pathname.startsWith('/browse') ||
        req.nextUrl.pathname.startsWith('/settings');
    const isOnAuthPage = req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/signup');

    // Redirect logged-in users away from auth pages
    if (isOnAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    // For now, don't block unauthenticated users from dashboard (for development)
    // In production, uncomment the following:
    // if (isOnDashboard && !isLoggedIn) {
    //   return NextResponse.redirect(new URL('/login', req.nextUrl));
    // }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
    ],
};
