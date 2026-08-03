// ============================================================
// resolveUserId.js — 使用者身份解析的「純邏輯」（CHASSIS）
//
// 這裡刻意不 import next/headers，也不碰真實 cookie：cookie 讀取與 JWT
// 驗證都由呼叫端注入。好處是這段最容易出錯的優先序邏輯可以直接單元測
// （見 test/resolveUserId.test.js），不需要 Next request context。
//
// 真正讀 cookie 的 wrapper 在 userId.js。
// ============================================================

export const COOKIE_AUTH_TOKEN = 'auth_token';
export const COOKIE_LINE_USER_ID = 'line_user_id';

// 底座沿用前身專案（supplement-tracker）的 cookie 名。要改名的話改這裡，
// 但注意既有使用者的匿名資料會對不上。
export const COOKIE_ANON_USER_ID = 'supplement_user_id';

/**
 * 依優先序解析使用者 ID，並回報「這個 ID 是怎麼來的」。
 *
 * source 的可信度由高到低：
 *   'jwt'       — 通過簽章驗證的登入使用者。唯一可信的身份。
 *   'line'      — LIFF 寫入的 LINE user ID cookie，未經本站驗證。
 *   'anon'      — 匿名 cookie，前端可讀寫（httpOnly: false）。
 *   'generated' — 全新隨機 UUID，代表這個請求根本沒有身份。
 *
 * 呼叫端務必依 source 決定要不要信：只有 'jwt' 能用來存取真實使用者資料。
 *
 * @param {object} deps
 * @param {(name: string) => string | undefined} deps.getCookie
 * @param {(token: string) => Promise<{ userId?: string } | null>} deps.verify
 * @param {() => string | null} deps.newId
 * @returns {Promise<{ userId: string | null, source: 'jwt'|'line'|'anon'|'generated' }>}
 */
export async function resolveUserId({ getCookie, verify, newId }) {
  const authToken = getCookie(COOKIE_AUTH_TOKEN);
  if (authToken) {
    const payload = await verify(authToken);
    // 驗不過就往下 fallback，不能直接信 token 裡的內容。
    if (payload?.userId) return { userId: payload.userId, source: 'jwt' };
  }

  const lineUserId = getCookie(COOKIE_LINE_USER_ID);
  if (lineUserId) return { userId: lineUserId, source: 'line' };

  const anonUserId = getCookie(COOKIE_ANON_USER_ID);
  if (anonUserId) return { userId: anonUserId, source: 'anon' };

  return { userId: newId(), source: 'generated' };
}
