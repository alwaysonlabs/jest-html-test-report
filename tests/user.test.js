// ── Inline user model & validation ───────────────────────────────────────────

function createUser({ name, email, age }) {
  if (!name || typeof name !== 'string') throw new Error('Invalid name');
  if (!isValidEmail(email)) throw new Error('Invalid email');
  if (!isValidAge(age)) throw new Error('Invalid age');
  return {
    id: Math.floor(Math.random() * 1_000_000),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    age,
    createdAt: new Date().toISOString(),
  };
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidAge(age) {
  return typeof age === 'number' && Number.isInteger(age) && age >= 0 && age <= 150;
}

function formatDisplayName(user) {
  return `${user.name} <${user.email}>`;
}

function hasPermission(user, permission) {
  const rolePermissions = {
    admin:  ['read', 'write', 'delete', 'manage'],
    editor: ['read', 'write'],
    viewer: ['read'],
  };
  return (rolePermissions[user.role] || []).includes(permission);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('isValidEmail', () => {
  test('accepts a standard email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('accepts email with subdomain', () => {
    expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
  });

  test('rejects address with no @', () => {
    expect(isValidEmail('notanemail')).toBe(false);
  });

  test('rejects address with no domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  test('rejects non-string input', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
  });
});

describe('isValidAge', () => {
  test('accepts age 0', () => {
    expect(isValidAge(0)).toBe(true);
  });

  test('accepts age 150', () => {
    expect(isValidAge(150)).toBe(true);
  });

  test('rejects negative age', () => {
    expect(isValidAge(-1)).toBe(false);
  });

  test('rejects fractional age', () => {
    expect(isValidAge(25.5)).toBe(false);
  });

  test('rejects string input', () => {
    expect(isValidAge('30')).toBe(false);
  });
});

describe('createUser', () => {
  test('creates a valid user object', () => {
    const user = createUser({ name: 'Alice', email: 'alice@example.com', age: 30 });
    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
    expect(user.age).toBe(30);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  test('normalises email to lowercase', () => {
    const user = createUser({ name: 'Bob', email: 'BOB@Example.COM', age: 25 });
    expect(user.email).toBe('bob@example.com');
  });

  test('throws on invalid email', () => {
    expect(() => createUser({ name: 'X', email: 'bad', age: 20 })).toThrow('Invalid email');
  });

  test('throws on invalid age', () => {
    expect(() => createUser({ name: 'X', email: 'x@x.com', age: -5 })).toThrow('Invalid age');
  });

  // ↓ skipped — duplicate email detection requires a data store (not yet wired up)
  test.skip('throws when email is already registered', () => {
    // pending: needs user repository integration
  });
});

describe('formatDisplayName', () => {
  test('formats name and email correctly', () => {
    const user = { name: 'Carol', email: 'carol@example.com' };
    expect(formatDisplayName(user)).toBe('Carol <carol@example.com>');
  });
});

describe('hasPermission', () => {
  const admin  = { role: 'admin' };
  const editor = { role: 'editor' };
  const viewer = { role: 'viewer' };

  test('admin has manage permission', () => {
    expect(hasPermission(admin, 'manage')).toBe(true);
  });

  test('editor can write but not delete', () => {
    expect(hasPermission(editor, 'write')).toBe(true);
    expect(hasPermission(editor, 'delete')).toBe(false);
  });

  test('viewer can only read', () => {
    expect(hasPermission(viewer, 'read')).toBe(true);
    expect(hasPermission(viewer, 'write')).toBe(false);
  });

  test('unknown role has no permissions', () => {
    expect(hasPermission({ role: 'ghost' }, 'read')).toBe(false);
  });

  // ↓ skipped — role inheritance not yet implemented
  test.skip('custom roles can inherit from base roles', () => {
    // pending: role hierarchy system
  });
});
