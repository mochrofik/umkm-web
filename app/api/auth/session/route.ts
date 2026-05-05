import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { token } = await request.json();

    if (!token) {
        return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ message: 'Token set successfully' });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('token');

    return NextResponse.json({ message: 'Token removed successfully' });
}
