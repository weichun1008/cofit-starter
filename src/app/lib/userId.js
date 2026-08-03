import { cookies } from 'next/headers';
import { verifyToken } from './auth.js';
import { UnauthorizedError } from './apiError.js';
import { COOKIE_ANON_USER_ID, resolveUserId } from './resolveUserId.js';

// ============================================================
// userId.js — 使用者身份（CHASSIS）
//
// 兩個 API，用途不同，**不要混用**：
//
//   getUserId()               寬鬆。JWT → LINE → 匿名 cookie → 新 UUID。
//                             沒登入也一定回一個 ID。適合 demo / 原型 /
//                             不含個資的功能。
//                             ⚠️ 這個 ID 不代表「已驗證的身份」。
//
//   getAuthenticatedUserId()  嚴格。只認通過簽章驗證的 JWT，其餘一律
//                             throw UnauthorizedError（→ 401）。
//                             任何會存真實使用者資料（個資 / 健康 / 金流）
//                             的路由都必須用這個。
//
// 為什麼要分兩個：寬鬆版的 fallback 末端會直接發一個新 UUID，而匿名
// cookie 是 httpOnly:false（前端可讀寫），所以呼叫端無法分辨「真的登入」
// 和「隨便帶一個 ID 來」。原型階段這是刻意的低摩擦設計，但一旦裝進真實
// 使用者資料就是越權（IDOR）漏洞。分成兩個 API，逼每個路由明確選一邊。
// ============================================================

async function createCookieGetter() {
  const store = await cookies();
  return (name) => store.get(name)?.value;
}

async function buildDeps(newId) {
  return { getCookie: await createCookieGetter(), verify: verifyToken, newId };
}

/** 寬鬆版 — 一定回一個 ID。詳見檔頭。 */
export async function getUserId() {
  const { userId } = await resolveUserId(await buildDeps(() => crypto.randomUUID()));
  return userId;
}

/** 嚴格版 — 只認 JWT，其餘 throw UnauthorizedError。詳見檔頭。 */
export async function getAuthenticatedUserId() {
  const { userId, source } = await resolveUserId(await buildDeps(() => null));
  if (source !== 'jwt' || !userId) throw new UnauthorizedError();
  return userId;
}

/**
 * 把匿名 user ID 寫回 cookie，讓同一個瀏覽器下次還認得。
 * 只給 getUserId() 這條寬鬆路線用；已登入的身份來自 httpOnly 的 auth_token。
 */
export function withUserCookie(response, userId) {
  response.cookies.set(COOKIE_ANON_USER_ID, userId, {
    // 前端有些地方會讀這個值，所以不能 httpOnly。
    // 也正因為如此，它不可作為身份憑證 —— 見檔頭。
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365 * 5, // 5 years
  });
  return response;
}
