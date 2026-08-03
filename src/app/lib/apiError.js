import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// ============================================================
// apiError.js — 把 throw 出來的錯轉成 HTTP response（CHASSIS）
//
// 領域 API 的寫法統一成：驗證 / 取身份直接 throw，最外層 catch 交給
// toErrorResponse()。這樣每個模組的錯誤格式一致，也不會不小心把內部
// 錯誤訊息漏給前端。
// ============================================================

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

export function toErrorResponse(error) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  // 未預期的錯誤：server 留完整 log，回前端只給通用訊息（不洩漏內部細節）。
  console.error('[api] unhandled error', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
