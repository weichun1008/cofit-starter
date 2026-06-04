// ============================================================
// config.js — 開新專案「主要只改這個檔」
// 集中所有每個專案會不一樣的設定：App 名稱、導覽列、路由↔LIFF 對應。
// ============================================================

export const APP = {
  name: 'Cofit Starter',
  nameEn: 'Cofit Starter',
  description: 'LINE / Web 多模組起手式（auth + DB + LIFF + AI + i18n）',
  themeColor: '#0a0a12',
  lang: 'zh-TW',
};

// 底部導覽列。icon 為 lucide-react 的圖示名稱（PascalCase）。
// label 走 i18n key（見 lib/i18n/*.json）。
export const NAV_ITEMS = [
  { href: '/', icon: 'House', labelKey: 'nav.home' },
  { href: '/example', icon: 'LayoutGrid', labelKey: 'nav.example' },
  { href: '/hq', icon: 'Settings', labelKey: 'nav.admin' },
];

// 路由前綴 → 該模組的 LIFF ID。
// 注意：NEXT_PUBLIC_* 必須「靜態」寫死在這裡，Next 才會在 build 時注入到前端。
// 不能用 process.env[變數名] 動態取（前端不會被替換）。
export const LIFF_ROUTES = [
  { prefix: '/example', liffId: process.env.NEXT_PUBLIC_LIFF_ID_EXAMPLE },
  // { prefix: '/booking', liffId: process.env.NEXT_PUBLIC_LIFF_ID_BOOKING },
];

// 找不到對應路由時的預設 LIFF ID（給 /、/login 等共用頁用）。
export const DEFAULT_LIFF_ID =
  process.env.NEXT_PUBLIC_LIFF_ID_EXAMPLE || null;
