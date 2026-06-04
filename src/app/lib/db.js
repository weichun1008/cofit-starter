import { neon } from '@neondatabase/serverless';

// ============================================================
// db.js — 平台底座資料層（CHASSIS）
// 包含：DB 連線、記憶體 fallback、migration、users(auth)、modules。
// 領域資料表請依「example items」的模式，新增到 initializeDatabase() 與下方 CRUD。
// ============================================================

// --- In-memory fallback：沒有 POSTGRES_URL 時，本機開發用記憶體，免裝 DB ---
let memoryStore = globalThis.__memoryStore;
if (!memoryStore) {
  memoryStore = {
    users: [],
    modules: [],
    items: [],      // 範例領域資料（example module）
    nextItemId: 1,
  };
  globalThis.__memoryStore = memoryStore;
}

function isLocalMode() {
  return !process.env.POSTGRES_URL;
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

let sql;
function getDb() {
  if (!sql) sql = neon(process.env.POSTGRES_URL);
  return sql;
}

// ============================================================
// initializeDatabase — 建表 + migration。每個 API 進入點都會先呼叫（冪等）。
// ============================================================
export async function initializeDatabase() {
  if (isLocalMode()) return { success: true, mode: 'memory' };

  const sql = getDb();

  // 使用者（auth 底座）
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(200) UNIQUE,
      password_hash VARCHAR(200),
      display_name VARCHAR(200),
      picture_url TEXT,
      auth_provider VARCHAR(20) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // 功能模組註冊表（HQ 後台可開關 / 排序）
  await sql`
    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(80) UNIQUE NOT NULL,
      name_zh VARCHAR(120),
      name_en VARCHAR(120),
      href VARCHAR(160),
      icon VARCHAR(60),
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // 範例領域資料表（複製這段模式建立你自己的領域表）
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      title VARCHAR(200) NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_items_user ON items(user_id)`;

  return { success: true, mode: 'postgres' };
}

// ============================================================
// Users / Auth（CHASSIS — 請勿刪，auth 路由依賴）
// ============================================================
export async function findUserByEmail(email) {
  if (isLocalMode()) return (memoryStore.users || []).find((u) => u.email === email) || null;
  const rows = await getDb()`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] || null;
}

export async function createEmailUser(id, email, passwordHash, displayName) {
  if (isLocalMode()) {
    const user = { id, email, password_hash: passwordHash, display_name: displayName, picture_url: null, auth_provider: 'email', role: 'user', created_at: new Date().toISOString() };
    memoryStore.users.push(user);
    return user;
  }
  const rows = await getDb()`
    INSERT INTO users (id, email, password_hash, display_name, auth_provider)
    VALUES (${id}, ${email}, ${passwordHash}, ${displayName}, 'email')
    RETURNING *
  `;
  return rows[0];
}

export async function findOrCreateLineUser(lineUserId, displayName, pictureUrl) {
  if (isLocalMode()) {
    let user = memoryStore.users.find((u) => u.id === lineUserId);
    if (!user) {
      user = { id: lineUserId, email: null, password_hash: null, display_name: displayName, picture_url: pictureUrl, auth_provider: 'line', role: 'user', created_at: new Date().toISOString() };
      memoryStore.users.push(user);
    }
    return user;
  }
  const sql = getDb();
  const existing = await sql`SELECT * FROM users WHERE id = ${lineUserId}`;
  if (existing.length > 0) {
    await sql`UPDATE users SET display_name = ${displayName}, picture_url = ${pictureUrl} WHERE id = ${lineUserId}`;
    return { ...existing[0], display_name: displayName, picture_url: pictureUrl };
  }
  const rows = await sql`
    INSERT INTO users (id, display_name, picture_url, auth_provider)
    VALUES (${lineUserId}, ${displayName}, ${pictureUrl}, 'line')
    RETURNING *
  `;
  return rows[0];
}

export async function findUserById(userId) {
  if (isLocalMode()) return (memoryStore.users || []).find((u) => u.id === userId) || null;
  const rows = await getDb()`SELECT * FROM users WHERE id = ${userId}`;
  return rows[0] || null;
}

export async function getAllUsers() {
  if (isLocalMode()) return memoryStore.users || [];
  return await getDb()`SELECT id, email, display_name, picture_url, auth_provider, role, created_at FROM users ORDER BY created_at DESC`;
}

export async function updateUserRole(userId, newRole) {
  if (isLocalMode()) {
    const user = (memoryStore.users || []).find((u) => u.id === userId);
    if (user) { user.role = newRole; return user; }
    return null;
  }
  const rows = await getDb()`UPDATE users SET role = ${newRole} WHERE id = ${userId} RETURNING *`;
  return rows[0];
}

// ============================================================
// Modules（CHASSIS — HQ 後台用）
// ============================================================
export async function getActiveModules() {
  if (isLocalMode()) {
    return (memoryStore.modules || []).filter((m) => m.is_active).sort((a, b) => a.sort_order - b.sort_order);
  }
  return await getDb()`SELECT * FROM modules WHERE is_active = true ORDER BY sort_order ASC`;
}

export async function getAllModules() {
  if (isLocalMode()) return (memoryStore.modules || []).sort((a, b) => a.sort_order - b.sort_order);
  return await getDb()`SELECT * FROM modules ORDER BY sort_order ASC`;
}

export async function updateModule(id, updates) {
  if (isLocalMode()) {
    const m = (memoryStore.modules || []).find((x) => String(x.id) === String(id));
    if (m) Object.assign(m, updates);
    return m || null;
  }
  const sql = getDb();
  const rows = await sql`
    UPDATE modules SET
      name_zh = COALESCE(${updates.name_zh ?? null}, name_zh),
      name_en = COALESCE(${updates.name_en ?? null}, name_en),
      is_active = COALESCE(${updates.is_active ?? null}, is_active),
      sort_order = COALESCE(${updates.sort_order ?? null}, sort_order)
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] || null;
}

export async function upsertModule(mod) {
  if (isLocalMode()) {
    let m = (memoryStore.modules || []).find((x) => x.slug === mod.slug);
    if (m) { Object.assign(m, mod); return m; }
    m = { id: (memoryStore.modules.length + 1), is_active: true, sort_order: 0, ...mod };
    memoryStore.modules.push(m);
    return m;
  }
  const sql = getDb();
  const rows = await sql`
    INSERT INTO modules (slug, name_zh, name_en, href, icon, is_active, sort_order)
    VALUES (${mod.slug}, ${mod.name_zh ?? null}, ${mod.name_en ?? null}, ${mod.href ?? null}, ${mod.icon ?? null}, ${mod.is_active ?? true}, ${mod.sort_order ?? 0})
    ON CONFLICT (slug) DO UPDATE SET
      name_zh = EXCLUDED.name_zh, name_en = EXCLUDED.name_en,
      href = EXCLUDED.href, icon = EXCLUDED.icon
    RETURNING *
  `;
  return rows[0];
}

// ============================================================
// Example domain: items（DEMO — 複製這個模式做你自己的領域 CRUD）
// ============================================================
export async function getItems(userId) {
  if (isLocalMode()) return memoryStore.items.filter((i) => i.user_id === userId);
  return await getDb()`SELECT * FROM items WHERE user_id = ${userId} ORDER BY created_at DESC`;
}

export async function getItemById(userId, id) {
  if (isLocalMode()) return memoryStore.items.find((i) => Number(i.id) === Number(id) && i.user_id === userId) || null;
  const rows = await getDb()`SELECT * FROM items WHERE id = ${id} AND user_id = ${userId}`;
  return rows[0] || null;
}

export async function createItem(userId, data) {
  if (isLocalMode()) {
    const item = { id: memoryStore.nextItemId++, user_id: userId, title: data.title, note: data.note || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    memoryStore.items.push(item);
    return item;
  }
  const rows = await getDb()`
    INSERT INTO items (user_id, title, note) VALUES (${userId}, ${data.title}, ${data.note || null}) RETURNING *
  `;
  return rows[0];
}

export async function updateItem(userId, id, data) {
  if (isLocalMode()) {
    const it = memoryStore.items.find((i) => i.id === id && i.user_id === userId);
    if (!it) return null;
    Object.assign(it, { title: data.title, note: data.note || null, updated_at: new Date().toISOString() });
    return it;
  }
  const rows = await getDb()`
    UPDATE items SET title = ${data.title}, note = ${data.note || null}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId} RETURNING *
  `;
  return rows[0] || null;
}

export async function deleteItem(userId, id) {
  if (isLocalMode()) {
    memoryStore.items = memoryStore.items.filter((i) => !(i.id === id && i.user_id === userId));
    return { success: true };
  }
  await getDb()`DELETE FROM items WHERE id = ${id} AND user_id = ${userId}`;
  return { success: true };
}
