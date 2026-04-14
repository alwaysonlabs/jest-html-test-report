// ── Inline array utilities ────────────────────────────────────────────────────

function flatten(arr) {
  return arr.reduce(
    (acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val),
    []
  );
}

function unique(arr) {
  return [...new Set(arr)];
}

function chunk(arr, size) {
  if (size <= 0) throw new Error('Chunk size must be positive');
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}

function zip(...arrays) {
  const length = Math.min(...arrays.map(a => a.length));
  return Array.from({ length }, (_, i) => arrays.map(a => a[i]));
}

function difference(a, b) {
  const setB = new Set(b);
  return a.filter(x => !setB.has(x));
}

function intersection(a, b) {
  const setB = new Set(b);
  return a.filter(x => setB.has(x));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('flatten', () => {
  test('flattens a one-level nested array', () => {
    expect(flatten([1, [2, 3], [4]])).toEqual([1, 2, 3, 4]);
  });

  test('flattens deeply nested arrays', () => {
    expect(flatten([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  test('returns the same array when already flat', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });

  test('handles empty arrays', () => {
    expect(flatten([])).toEqual([]);
  });
});

describe('unique', () => {
  test('removes duplicate numbers', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  test('removes duplicate strings', () => {
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  test('returns unchanged array when no duplicates', () => {
    expect(unique([10, 20, 30])).toEqual([10, 20, 30]);
  });
});

describe('chunk', () => {
  test('splits array into chunks of given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('returns a single chunk when size >= array length', () => {
    expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
  });

  test('throws when chunk size is 0', () => {
    expect(() => chunk([1, 2], 0)).toThrow('Chunk size must be positive');
  });

  // ↓ skipped — edge-case behavior for empty arrays not yet decided
  test.skip('handles empty array input', () => {
    expect(chunk([], 3)).toEqual([]);
  });
});

describe('groupBy', () => {
  const people = [
    { name: 'Alice', dept: 'Engineering' },
    { name: 'Bob',   dept: 'Design' },
    { name: 'Carol', dept: 'Engineering' },
    { name: 'Dave',  dept: 'Design' },
  ];

  test('groups objects by a string key', () => {
    const result = groupBy(people, p => p.dept);
    expect(result['Engineering']).toHaveLength(2);
    expect(result['Design']).toHaveLength(2);
  });

  test('groups numbers by even/odd', () => {
    const nums = [1, 2, 3, 4, 5, 6];
    const result = groupBy(nums, n => (n % 2 === 0 ? 'even' : 'odd'));
    expect(result.even).toEqual([2, 4, 6]);
    expect(result.odd).toEqual([1, 3, 5]);
  });

  // ↓ skipped — groupBy with async key function not yet implemented
  test.skip('supports async key functions', () => {
    // pending implementation
  });
});

describe('zip', () => {
  test('zips two arrays together', () => {
    expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  test('truncates to the shortest array', () => {
    expect(zip([1, 2, 3], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']]);
  });

  test('zips three arrays', () => {
    expect(zip([1, 2], ['a', 'b'], [true, false])).toEqual([[1, 'a', true], [2, 'b', false]]);
  });
});

describe('difference and intersection', () => {
  test('difference returns elements only in first array', () => {
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
  });

  test('intersection returns shared elements', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  // ↓ skipped — symmetric difference not yet implemented
  test.skip('symmetricDifference returns elements in either but not both', () => {
    // pending implementation
  });
});
