import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth';
import { getAuthenticatedUserId } from '@/app/lib/userId';
import { initializeDatabase, findUserById, findOrCreateLineUser } from '@/app/lib/db';

export async function GET() {
    try {
        await initializeDatabase();

        // 嚴格身份解析：沒有 / 驗不過 JWT 都會 throw UnauthorizedError，落到下方 catch。
        // 這個端點刻意回 { authenticated: false } 而不是 toErrorResponse() 的通用格式，
        // 因為 AuthProvider 讀的是 authenticated 欄位。
        const userId = await getAuthenticatedUserId();

        const user = await findUserById(userId);
        if (!user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
                pictureUrl: user.picture_url,
                authProvider: user.auth_provider,
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}

// POST /api/auth/me — for LINE login (create/update user from LIFF profile)
export async function POST(request) {
    try {
        await initializeDatabase();
        const { lineUserId, displayName, pictureUrl } = await request.json();

        if (!lineUserId) {
            return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 });
        }

        const user = await findOrCreateLineUser(lineUserId, displayName, pictureUrl);

        const { signToken, setAuthCookie } = await import('@/app/lib/auth');
        const token = await signToken(user.id);

        const response = NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                displayName: user.display_name,
                pictureUrl: user.picture_url,
                authProvider: user.auth_provider,
            }
        });

        setAuthCookie(response, token);

        // Also set supplement_user_id cookie
        response.cookies.set('supplement_user_id', user.id, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365 * 5,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('LINE auth error:', error);
        return NextResponse.json({ error: 'LINE 登入失敗' }, { status: 500 });
    }
}

// DELETE /api/auth/me — logout
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    response.cookies.set('supplement_user_id', '', { maxAge: 0, path: '/' });
    response.cookies.set('line_user_id', '', { maxAge: 0, path: '/' });
    return response;
}
