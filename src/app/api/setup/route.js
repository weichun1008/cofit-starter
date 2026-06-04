import { NextResponse } from 'next/server';
import { initializeDatabase, upsertModule } from '@/app/lib/db';

// 一鍵初始化：建表 + 種入預設模組。部署後打一次 GET /api/setup。
export async function GET() {
    try {
        const result = await initializeDatabase();
        await upsertModule({ slug: 'example', name_zh: '範例模組', name_en: 'Example', href: '/example', icon: 'LayoutGrid', sort_order: 1, is_active: true });
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('Setup failed:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
