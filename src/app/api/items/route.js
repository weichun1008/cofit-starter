import { NextResponse } from 'next/server';
import { getUserId, withUserCookie } from '@/app/lib/userId';
import { toErrorResponse } from '@/app/lib/apiError';
import { initializeDatabase, getItems, createItem } from '@/app/lib/db';
import { itemCreateSchema } from '@/app/(services)/example/schema';

// ============================================================
// 範例領域 API（list + create）。複製這個檔做你自己的領域資源。
//
// 標準寫法三件事：
//   1. 用 zod schema.parse() 驗證 input（失敗會 throw，由 catch 轉 400）
//   2. 用 getUserId() 取身份
//   3. 整個 handler 包 try/catch，錯誤交給 toErrorResponse()
//
// ⚠️ 身份：這個範例用寬鬆版 getUserId()，沒登入也能用（原型友善）。
//    要放真實使用者資料時改成 getAuthenticatedUserId()，未登入自動 401：
//      import { getAuthenticatedUserId } from '@/app/lib/userId';
//      const userId = await getAuthenticatedUserId();
//    詳見 lib/userId.js 檔頭。
// ============================================================

export async function GET() {
  try {
    await initializeDatabase();
    const userId = await getUserId();
    const items = await getItems(userId);
    return withUserCookie(NextResponse.json({ items }), userId);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const userId = await getUserId();
    const data = itemCreateSchema.parse(await request.json());
    const item = await createItem(userId, data);
    return withUserCookie(NextResponse.json({ item }), userId);
  } catch (error) {
    return toErrorResponse(error);
  }
}
