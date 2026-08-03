import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  comparePassword,
  hashPassword,
  signToken,
  verifyToken,
} from '../src/app/lib/auth.js';

describe('auth — JWT', () => {
  test('簽出來的 token 驗得回同一個 userId', async () => {
    const token = await signToken('user-123');
    const payload = await verifyToken(token);

    assert.equal(payload.userId, 'user-123');
  });

  test('被竄改的 token 回 null 而不是 throw', async () => {
    // verifyToken 吞掉錯誤回 null 是刻意的，呼叫端才能用 falsy 判斷。
    const token = await signToken('user-123');
    const tampered = `${token.slice(0, -3)}xyz`;

    assert.equal(await verifyToken(tampered), null);
  });

  test('完全不是 JWT 的字串回 null', async () => {
    assert.equal(await verifyToken('not-a-token'), null);
  });
});

describe('auth — 密碼', () => {
  test('hash 後不等於原文，且驗得回來', async () => {
    const hash = await hashPassword('s3cret-pw');

    assert.notEqual(hash, 's3cret-pw');
    assert.equal(await comparePassword('s3cret-pw', hash), true);
  });

  test('錯誤密碼驗不過', async () => {
    const hash = await hashPassword('s3cret-pw');

    assert.equal(await comparePassword('wrong-pw', hash), false);
  });

  test('同一個密碼兩次 hash 不同（有 salt）', async () => {
    const a = await hashPassword('same-pw');
    const b = await hashPassword('same-pw');

    assert.notEqual(a, b);
  });
});
