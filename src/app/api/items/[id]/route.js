import { NextResponse } from 'next/server';
import { getUserId } from '@/app/lib/userId';
import { initializeDatabase, updateItem, deleteItem } from '@/app/lib/db';

export async function PATCH(request, { params }) {
    await initializeDatabase();
    const userId = await getUserId();
    const { id } = await params;
    const data = await request.json();
    const item = await updateItem(userId, Number(id), data);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
}

export async function DELETE(request, { params }) {
    await initializeDatabase();
    const userId = await getUserId();
    const { id } = await params;
    await deleteItem(userId, Number(id));
    return NextResponse.json({ success: true });
}
