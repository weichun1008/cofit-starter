import { NextResponse } from 'next/server';
import { initializeDatabase, getActiveModules } from '@/app/lib/db';

// 公開：取得啟用中的模組（給前端 ModuleProvider）
export async function GET() {
    try {
        await initializeDatabase();
        const modules = await getActiveModules();
        return NextResponse.json({ modules });
    } catch (error) {
        console.error('Failed to fetch modules:', error);
        return NextResponse.json({ modules: [] });
    }
}
