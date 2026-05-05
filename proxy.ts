import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    // Jika request menuju /api, tambahkan token ke header Authorization
    if (token && request.nextUrl.pathname.startsWith('/api')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('Authorization', `Bearer ${token}`);

        // Teruskan request dengan header baru
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Hanya jalankan proxy untuk path /api
export const config = {
    matcher: '/api/:path*',
};
