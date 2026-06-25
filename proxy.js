import { NextResponse } from 'next/server';

export function proxy(request) {
    const path = request.nextUrl.pathname;

    const publicRoutes = ['/', '/login', '/register', '/signup', '/unauthorized'];
    const isPublicPath = publicRoutes.includes(path);

    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') || 
        path.includes('.') // Allows files like favicon.ico or image.png
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value || 
                  request.cookies.get('next-auth.session-token')?.value || 
                  request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    //Has Token + Trying to view Login/Register? Kick to Dashboard!
    if (token && (path === '/login' || path === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

//Run this middleware on absolutely every single route
export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};