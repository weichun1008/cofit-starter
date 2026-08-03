# 怎麼新增一個模組

底座的設計是「平台 + 模組」。新功能 = 一個模組 = 一個頁面資料夾 + 一組 API + 一張資料表。照 `example` 抄就好。

## 1. 資料表（`lib/db.js`）
在 `initializeDatabase()` 加一張表（複製 `items` 那段），並在下方加 CRUD 函式（複製 `getItems / createItem / ...`）。本機記憶體模式記得也加對應的 `memoryStore` 陣列。

## 2. 驗證 schema（`(services)/<module>/schema.js`）
複製 `(services)/example/schema.js`，把欄位改成你的。**API 和表單共用這一份**，驗證規則才不會兩邊 drift。

## 3. API（`api/<resource>/`）
複製 `api/items/route.js`（list + create）與 `api/items/[id]/route.js`（update + delete），改成你的資源名稱與欄位。

每個 handler 三件事：

1. `await initializeDatabase()`
2. 用 `schema.parse(await request.json())` 驗 input（失敗會 throw，catch 會轉成 400）
3. 整段包 `try/catch`，錯誤丟給 `toErrorResponse(error)`

**取使用者身份要選對**：

| 用哪個 | 行為 | 什麼時候用 |
|---|---|---|
| `getUserId()` | 一定回一個 ID，沒身份就發新 UUID | demo / 原型 / 不含個資的功能 |
| `getAuthenticatedUserId()` | 只認驗過的 JWT，其餘 throw → 401 | **任何存真實使用者資料的路由** |

寬鬆版分不出「真的登入」和「前端隨便帶一個 ID 來」，把它當身份守門就是 IDOR 漏洞。細節見 `lib/userId.js` 檔頭。

## 4. 頁面（`(services)/<module>/page.js`）
複製整個 `(services)/example/` 資料夾，裡面有四個檔要一起帶走：

- `page.js` — 示範 i18n、auth context、呼叫領域 API、底部導覽
- `schema.js` — 見步驟 2
- `error.js` — 該區塊的錯誤邊界，避免整頁白屏
- `loading.js` — 骨架載入狀態

## 5. i18n（`lib/i18n/*.json`）
加上你的字串（巢狀 key，例如 `booking.title`），`t('booking.title')` 取用。

## 6. 掛上導覽 / 模組系統
- 想固定顯示在底部導覽：到 `lib/config.js` 的 `NAV_ITEMS` 加一筆（icon 用 lucide-react 名稱）。
- 想由後台動態開關：到 `api/setup` 的 `upsertModule(...)` 加一筆，部署後打 `/api/setup`，再到 `/hq` 開關。

## 7. LINE LIFF（選用）
若該模組要在 LINE 內開：到 `lib/config.js` 的 `LIFF_ROUTES` 加 `{ prefix: '/booking', liffId: process.env.NEXT_PUBLIC_LIFF_ID_BOOKING }`，並在 `.env.local` 填該 LIFF ID。

## 8. AI（選用）
要做圖片/問卷分析：前端把你的領域 prompt + 圖片（dataURL）POST 到 `/api/analyze`，回傳解析後 JSON。提示詞放在你的模組裡，不要塞進 `analyze`。

---
原則：**底座（auth/db 核心/i18n/LIFF/analyze/notify/模組系統）盡量不要改**；領域邏輯都長在模組裡。這樣下個專案還能無痛複製底座。
