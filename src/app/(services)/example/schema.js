import { z } from 'zod';

// ============================================================
// schema.js — 領域契約（DEMO，複製這個模式做你自己的模組）
//
// API 與表單共用同一份 schema，驗證規則才不會兩邊 drift。
// 複製模組時記得把這個檔一起帶走。
// ============================================================

export const itemCreateSchema = z.object({
  title: z.string().trim().min(1, 'title 不可為空').max(200, 'title 最多 200 字'),
  note: z.string().trim().max(2000, 'note 最多 2000 字').optional(),
});

// PATCH 是部分更新：每個欄位都可省略，但不能整包空的。
export const itemUpdateSchema = itemCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少要提供一個要更新的欄位',
  });
