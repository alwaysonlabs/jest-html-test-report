// ── Inline string utilities ───────────────────────────────────────────────────

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function truncate(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
}

function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

function countWords(str) {
  if (!str || !str.trim()) return 0;
  return str.trim().split(/\s+/).length;
}

function repeat(str, times) {
  if (times < 0) throw new Error('times must be non-negative');
  return str.repeat(times);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('capitalize', () => {
  test('capitalizes a lowercase word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('lowercases the rest of the string', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });

  test('returns empty string for empty input', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('slugify', () => {
  test('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  test('strips special characters', () => {
    expect(slugify('Café & Bistro!')).toBe('caf-bistro');
  });

  test('collapses multiple hyphens', () => {
    expect(slugify('one  --  two')).toBe('one-two');
  });

  // ✗ intentionally wrong expected value
  test('handles leading and trailing spaces', () => {
    expect(slugify('  hello world  ')).toBe('hello--world');
  });
});

describe('truncate', () => {
  test('does not truncate when string is short enough', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  test('truncates long strings with default suffix', () => {
    expect(truncate('The quick brown fox', 10)).toBe('The qui...');
  });

  test('uses custom suffix', () => {
    expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
  });
});

describe('toCamelCase', () => {
  test('converts hyphenated string', () => {
    expect(toCamelCase('hello-world')).toBe('helloWorld');
  });

  test('converts snake_case string', () => {
    expect(toCamelCase('foo_bar_baz')).toBe('fooBarBaz');
  });

  test('converts space-separated words', () => {
    expect(toCamelCase('get user name')).toBe('getUserName');
  });
});

describe('isPalindrome', () => {
  test('detects a simple palindrome', () => {
    expect(isPalindrome('racecar')).toBe(true);
  });

  test('ignores spaces and punctuation', () => {
    expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
  });

  test('returns false for non-palindrome', () => {
    expect(isPalindrome('hello')).toBe(false);
  });
});

describe('countWords', () => {
  test('counts words in a sentence', () => {
    expect(countWords('the quick brown fox')).toBe(4);
  });

  test('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  test('handles extra whitespace', () => {
    expect(countWords('  one   two  three  ')).toBe(3);
  });
});

describe('repeat', () => {
  test('repeats a string the given number of times', () => {
    expect(repeat('ab', 3)).toBe('ababab');
  });

  test('returns empty string when times is 0', () => {
    expect(repeat('xyz', 0)).toBe('');
  });

  test('throws when times is negative', () => {
    expect(() => repeat('x', -1)).toThrow('times must be non-negative');
  });
});
