// ── Inline async utilities ────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUser(id) {
  await delay(10);
  const users = {
    1: { id: 1, name: 'Alice', role: 'admin' },
    2: { id: 2, name: 'Bob',   role: 'editor' },
    3: { id: 3, name: 'Carol', role: 'viewer' },
  };
  if (!users[id]) throw new Error(`User ${id} not found`);
  return users[id];
}

async function fetchMultipleUsers(ids) {
  return Promise.all(ids.map(fetchUser));
}

async function retry(fn, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('fetchUser', () => {
  test('returns user for a valid id', async () => {
    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: 'Alice', role: 'admin' });
  });

  test('returns correct role for user 2', async () => {
    const user = await fetchUser(2);
    expect(user.role).toBe('editor');
  });

  test('throws when user is not found', async () => {
    await expect(fetchUser(99)).rejects.toThrow('User 99 not found');
  });

  // ✗ intentionally wrong: user 3 is a viewer, not an admin
  test('user 3 has admin role', async () => {
    const user = await fetchUser(3);
    expect(user.role).toBe('admin');
  });
});

describe('fetchMultipleUsers', () => {
  test('returns all requested users in order', async () => {
    const users = await fetchMultipleUsers([1, 2, 3]);
    expect(users).toHaveLength(3);
    expect(users.map(u => u.name)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  test('rejects if any id is invalid', async () => {
    await expect(fetchMultipleUsers([1, 999])).rejects.toThrow('User 999 not found');
  });
});

describe('retry', () => {
  test('returns result on first successful attempt', async () => {
    const result = await retry(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  test('retries and succeeds on a later attempt', async () => {
    let calls = 0;
    const fn = () => {
      calls++;
      if (calls < 3) throw new Error('not yet');
      return Promise.resolve('done');
    };
    const result = await retry(fn, 3);
    expect(result).toBe('done');
    expect(calls).toBe(3);
  });

  test('throws after exhausting all attempts', async () => {
    const fn = () => Promise.reject(new Error('always fails'));
    await expect(retry(fn, 3)).rejects.toThrow('always fails');
  });
});

describe('withTimeout', () => {
  test('resolves when operation completes in time', async () => {
    const result = await withTimeout(delay(5).then(() => 'ok'), 200);
    expect(result).toBe('ok');
  });

  test('rejects when operation exceeds timeout', async () => {
    await expect(withTimeout(delay(500), 50)).rejects.toThrow('Operation timed out');
  });

  // ↓ skipped — cancellation tokens not yet supported
  test.skip('can cancel in-flight operations via AbortController', () => {
    // pending implementation
  });
});
