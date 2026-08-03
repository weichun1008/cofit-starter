import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  COOKIE_ANON_USER_ID,
  COOKIE_AUTH_TOKEN,
  COOKIE_LINE_USER_ID,
  resolveUserId,
} from '../src/app/lib/resolveUserId.js';

// 用假 cookie / 假 verify 測純邏輯，不需要 Next request context。
function makeDeps(cookies = {}, { verify, newId } = {}) {
  return {
    getCookie: (name) => cookies[name],
    verify: verify ?? (async () => null),
    newId: newId ?? (() => 'generated-id'),
  };
}

describe('resolveUserId — 身份來源優先序', () => {
  test('JWT 驗證成功時優先採用，並標記 source=jwt', async () => {
    const result = await resolveUserId(
      makeDeps(
        {
          [COOKIE_AUTH_TOKEN]: 'good-token',
          [COOKIE_LINE_USER_ID]: 'line-user',
          [COOKIE_ANON_USER_ID]: 'anon-user',
        },
        { verify: async () => ({ userId: 'jwt-user' }) },
      ),
    );

    assert.deepEqual(result, { userId: 'jwt-user', source: 'jwt' });
  });

  test('JWT 驗證失敗時不可採信，往下 fallback', async () => {
    const result = await resolveUserId(
      makeDeps(
        { [COOKIE_AUTH_TOKEN]: 'tampered', [COOKIE_LINE_USER_ID]: 'line-user' },
        { verify: async () => null },
      ),
    );

    assert.deepEqual(result, { userId: 'line-user', source: 'line' });
  });

  test('JWT payload 沒有 userId 也算失敗', async () => {
    const result = await resolveUserId(
      makeDeps({ [COOKIE_AUTH_TOKEN]: 'no-sub' }, { verify: async () => ({ foo: 'bar' }) }),
    );

    assert.equal(result.source, 'generated');
  });

  test('沒有 JWT 時採用 LINE cookie', async () => {
    const result = await resolveUserId(
      makeDeps({ [COOKIE_LINE_USER_ID]: 'line-user', [COOKIE_ANON_USER_ID]: 'anon-user' }),
    );

    assert.deepEqual(result, { userId: 'line-user', source: 'line' });
  });

  test('只剩匿名 cookie 時採用它，但標記 source=anon', async () => {
    const result = await resolveUserId(makeDeps({ [COOKIE_ANON_USER_ID]: 'anon-user' }));

    assert.deepEqual(result, { userId: 'anon-user', source: 'anon' });
  });

  test('完全沒有身份時發新 ID，並標記 source=generated', async () => {
    const result = await resolveUserId(makeDeps({}, { newId: () => 'fresh' }));

    assert.deepEqual(result, { userId: 'fresh', source: 'generated' });
  });

  test('嚴格模式（newId 回 null）在無 JWT 時不會產生可用身份', async () => {
    // getAuthenticatedUserId() 就是靠這個性質把未登入請求擋成 401。
    const result = await resolveUserId(makeDeps({}, { newId: () => null }));

    assert.equal(result.userId, null);
    assert.notEqual(result.source, 'jwt');
  });
});
