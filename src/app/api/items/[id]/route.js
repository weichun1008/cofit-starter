import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/userId';
import { toErrorResponse } from '@/app/lib/apiError';
import { initializeDatabase, updateItem, deleteItem } from '@/app/lib/db';
import { itemUpdateSchema } from '@/app/(services)/example/schema';

// 範例領域 API（update + delete）。寫法慣例見 ../route.js 檔頭。

export async function PATCH(request, { params }) {
  try {
    await initializeDatabase();
    const userId = await getUserId();
    const { id } = await params;
    const data = itemUpdateSchema.parse(await request.json());
    const item = await updateItem(userId, Number(id), data);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const userId = await getUserId();
    const { id } = await params;
    await deleteItem(userId, Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
