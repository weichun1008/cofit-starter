import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/userId';
import { initializeDatabase, findUserById, getAllModules } from '@/app/lib/db';

// 後台：取得全部模組（含停用）。MVP 先放行，正式環境請開啟下方角色檢查。
export async function GET() {
    try {
        await initializeDatabase();
        const currentUserId = await getUserId();
        if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findUserById(currentUserId);
        // if (!user || !['admin', 'superadmin'].includes(user.role)) {
        //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        // }

        const modules = await getAllModules();
        return NextResponse.json({ modules });
    } catch (error) {
        console.error('Failed to fetch HQ modules:', error);
        return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
    }
}
