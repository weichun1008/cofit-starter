import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';

// 底座在沒有 POSTGRES_URL 時走記憶體模式，這組測試就是測那一條路。
// 必須在 import db.js 之前清掉，因為 isLocalMode() 每次呼叫都讀 env。
delete process.env.POSTGRES_URL;

const { initializeDatabase, getItems, getItemById, createItem, updateItem, deleteItem } =
  await import('../src/app/lib/db.js');

// memoryStore 掛在 globalThis 上，同一個 process 內共用。
// 每個測試用自己的 userId 隔離，避免互相污染。
let seq = 0;
const nextUser = () => `user-${++seq}`;

describe('db（記憶體模式）— items CRUD', () => {
  before(async () => {
    const result = await initializeDatabase();
    assert.equal(result.mode, 'memory', '沒有 POSTGRES_URL 時應該走記憶體模式');
  });

  test('建立後讀得回來', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: '喝水', note: '每天 2000ml' });

    assert.equal(created.title, '喝水');
    assert.equal(created.user_id, userId);

    const items = await getItems(userId);
    assert.equal(items.length, 1);
    assert.equal(items[0].id, created.id);
  });

  test('沒給 note 時存成 null，不是 undefined', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: '走路' });

    assert.equal(created.note, null);
  });

  test('看不到別人的資料', async () => {
    const owner = nextUser();
    const stranger = nextUser();
    await createItem(owner, { title: '我的' });

    assert.deepEqual(await getItems(stranger), []);
  });

  test('getItemById 對字串 / 數字 id 行為一致', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: '睡覺' });

    assert.equal((await getItemById(userId, created.id))?.id, created.id);
    assert.equal((await getItemById(userId, String(created.id)))?.id, created.id);
  });

  test('getItemById 不會撈到別人的', async () => {
    const owner = nextUser();
    const stranger = nextUser();
    const created = await createItem(owner, { title: '我的' });

    assert.equal(await getItemById(stranger, created.id), null);
  });
});

describe('db（記憶體模式）— updateItem 的 PATCH 語意', () => {
  test('只給 note 時不會清掉 title（迴歸測試）', async () => {
    // 舊版無條件覆寫 title = data.title，PATCH {note} 會把 title 變成 undefined。
    const userId = nextUser();
    const created = await createItem(userId, { title: '原本的標題', note: '原本的備註' });

    const updated = await updateItem(userId, created.id, { note: '只改備註' });

    assert.equal(updated.title, '原本的標題');
    assert.equal(updated.note, '只改備註');
  });

  test('只給 title 時不會清掉 note', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: 'A', note: '保留我' });

    const updated = await updateItem(userId, created.id, { title: 'B' });

    assert.equal(updated.title, 'B');
    assert.equal(updated.note, '保留我');
  });

  test('會更新 updated_at', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: 'A' });
    const before = created.updated_at;

    const updated = await updateItem(userId, created.id, { title: 'B' });

    assert.ok(updated.updated_at >= before);
  });

  test('改不到別人的資料，回 null', async () => {
    const owner = nextUser();
    const stranger = nextUser();
    const created = await createItem(owner, { title: '我的' });

    assert.equal(await updateItem(stranger, created.id, { title: '被改了' }), null);
    assert.equal((await getItemById(owner, created.id)).title, '我的');
  });

  test('不存在的 id 回 null', async () => {
    assert.equal(await updateItem(nextUser(), 999999, { title: 'X' }), null);
  });
});

describe('db（記憶體模式）— deleteItem', () => {
  test('刪掉後讀不到', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: '要刪的' });

    await deleteItem(userId, created.id);

    assert.deepEqual(await getItems(userId), []);
  });

  test('字串 id 也刪得掉（route 會傳 Number，但別人可能不會）', async () => {
    const userId = nextUser();
    const created = await createItem(userId, { title: '要刪的' });

    await deleteItem(userId, String(created.id));

    assert.deepEqual(await getItems(userId), []);
  });

  test('刪不掉別人的資料', async () => {
    const owner = nextUser();
    const stranger = nextUser();
    const created = await createItem(owner, { title: '我的' });

    await deleteItem(stranger, created.id);

    assert.equal((await getItems(owner)).length, 1);
  });
});
