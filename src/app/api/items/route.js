import { NextResponse } from 'next/server';
import { getUserId, withUserCookie } from '@/app/lib/userId';
import { initializeDatabase, getItems, createItem } from '@/app/lib/db';

// 範例領域 API（list + create）。複製這個檔做你自己的領域資源。
export async function GET() {
    await initializeDatabase();
    const userId = await getUserId();
    const items = await getItems(userId);
    return withUserCookie(NextResponse.json({ items }), userId);
}

export async function POST(request) {
    await initializeDatabase();
    const userId = await getUserId();
    const data = await request.json();
    if (!data.title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    const item = await createItem(userId, data);
    return withUserCookie(NextResponse.json({ item }), userId);
}
