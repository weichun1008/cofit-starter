import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/userId';
import { initializeDatabase, findUserById, updateModule } from '@/app/lib/db';

// 後台：更新單一模組（名稱 / 啟用 / 排序）
export async function PATCH(request, { params }) {
    try {
        await initializeDatabase();
        const currentUserId = await getUserId();
        if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await findUserById(currentUserId); // 正式環境請在此檢查角色

        const { id } = await params;
        if (!id) return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });

        const { name_zh, name_en, is_active, sort_order } = await request.json();
        const mod = await updateModule(id, { name_zh, name_en, is_active, sort_order });
        if (!mod) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

        return NextResponse.json({ module: mod });
    } catch (error) {
        console.error('Failed to update module:', error);
        return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
    }
}
