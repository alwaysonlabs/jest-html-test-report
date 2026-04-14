// ── Inline math utilities ─────────────────────────────────────────────────────

function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }
function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function roundTo(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}
function factorial(n) {
  if (n < 0) throw new Error('Negative factorial');
  return n <= 1 ? 1 : n * factorial(n - 1);
}
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Basic arithmetic', () => {
  test('adds two positive numbers', () => {
    expect(add(3, 4)).toBe(7);
  });

  test('adds a positive and a negative number', () => {
    expect(add(10, -4)).toBe(6);
  });

  test('subtracts correctly', () => {
    expect(subtract(15, 6)).toBe(9);
  });

  test('multiplies two numbers', () => {
    expect(multiply(6, 7)).toBe(42);
  });

  test('divides evenly', () => {
    expect(divide(100, 4)).toBe(25);
  });

  test('throws on division by zero', () => {
    expect(() => divide(5, 0)).toThrow('Division by zero');
  });
});

describe('clamp', () => {
  test('returns value when within range', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  test('clamps to min when value is too low', () => {
    expect(clamp(-3, 0, 100)).toBe(0);
  });

  test('clamps to max when value is too high', () => {
    expect(clamp(200, 0, 100)).toBe(100);
  });
});

describe('roundTo', () => {
  test('rounds to 2 decimal places', () => {
    expect(roundTo(3.14159, 2)).toBe(3.14);
  });

  test('rounds to 0 decimal places', () => {
    expect(roundTo(7.6, 0)).toBe(8);
  });
});

describe('factorial', () => {
  test('factorial of 0 is 1', () => {
    expect(factorial(0)).toBe(1);
  });

  test('factorial of 5 is 120', () => {
    expect(factorial(5)).toBe(120);
  });

  // ✗ intentionally wrong expected value
  test('factorial of 6 is 720', () => {
    expect(factorial(6)).toBe(700);
  });

  test('throws on negative input', () => {
    expect(() => factorial(-1)).toThrow('Negative factorial');
  });
});

describe('isPrime', () => {
  test('2 is prime', () => {
    expect(isPrime(2)).toBe(true);
  });

  test('17 is prime', () => {
    expect(isPrime(17)).toBe(true);
  });

  test('1 is not prime', () => {
    expect(isPrime(1)).toBe(false);
  });

  test('9 is not prime', () => {
    expect(isPrime(9)).toBe(false);
  });
});
