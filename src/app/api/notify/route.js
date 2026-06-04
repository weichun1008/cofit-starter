import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/userId';

// ============================================================
// /api/notify — 通用 LINE 推播（CHASSIS）
// 缺 token 時自動略過（不會在 build / 本機開發炸掉）。
// POST body: { message: string(必填), to?: lineUserId(預設為當前使用者) }
// ============================================================

const getLineClient = async () => {
    const { Client } = await import('@line/bot-sdk');
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) return null;
    return new Client({ channelAccessToken: token });
};

export async function POST(request) {
    try {
        const userId = await getUserId();
        const { message, to } = await request.json();
        const target = to || userId;

        if (!target) return NextResponse.json({ error: 'No recipient' }, { status: 401 });
        if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });

        const client = await getLineClient();
        if (!client) {
            console.warn('LINE_CHANNEL_ACCESS_TOKEN not configured. Skipping push.');
            return NextResponse.json({ success: true, warning: 'No token configured' });
        }

        await client.pushMessage(target, { type: 'text', text: message });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push message error:', error);
        return NextResponse.json({ error: 'Failed to send push message' }, { status: 500 });
    }
}
