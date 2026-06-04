# Cofit Starter — LINE / Web 多模組起手式

從 supplement-tracker 抽出的**平台底座**，給未來新專案當起手式，省下重接 auth / DB / LINE / AI 的時間。

## 內含底座（chassis）
| 能力 | 檔案 |
|---|---|
| 認證（JWT + bcrypt + LINE 登入） | `lib/auth.js`、`components/auth/AuthProvider.js`、`api/auth/*` |
| 資料層（Neon Postgres + 記憶體 fallback + migration） | `lib/db.js` |
| 使用者身份解析（JWT → LINE → cookie → UUID） | `lib/userId.js` |
| LINE LIFF（登入、深連結 path 還原） | `components/liff/LiffProvider.js` |
| AI 視覺/文字分析（Gemini，含模型 fallback） | `api/analyze/route.js` |
| LINE 推播 | `api/notify/route.js` |
| 多語 i18n | `lib/i18n/*` |
| 模組系統 + HQ 後台（開關 / 排序） | `components/modules/*`、`api/modules`、`api/hq/*`、`/hq` |
| 共用 UI | `components/Navbar.js`、`LanguageSwitcher.js`、`CameraCapture.js` |
| 範例領域模組（複製範本） | `(services)/example`、`api/items` |

## 🔑 開新專案只要改 `src/app/lib/config.js`
App 名稱、底部導覽列、路由↔LIFF 對應，全集中在這一個檔。

## 快速開始
```bash
cp .env.example .env.local   # 全留空也能跑（記憶體模式）
npm install
npm run dev                  # http://localhost:3000
```
部署到正式環境（接 Postgres）後，打一次 `GET /api/setup` 建表 + 種入預設模組。

## 用這個範本開新專案
```bash
# 複製範本（不帶 git 歷史）
npx degit ./cofit-starter my-new-app    # 或直接複製資料夾
cd my-new-app && npm install
```
然後：
1. 改 `src/app/lib/config.js`（App 名、導覽、LIFF）。
2. 照 `docs/MODULE_GUIDE.md` 複製 `example` 模組做你的功能。
3. 填 `.env.local`，部署，打 `/api/setup`。

## 環境變數
見 `.env.example`。全部選填——缺哪個，對應功能就自動停用（不會炸）。

## 注意
- 使用者 ID cookie 名為 `supplement_user_id`（底座沿用，可全域改名）。
- 模組後台 `api/hq/*` 目前為 MVP 放行，正式環境請打開角色檢查（檔內有註解位置）。
- 設計慣例：UI 圖示一律用 `lucide-react`（不用 emoji）。
