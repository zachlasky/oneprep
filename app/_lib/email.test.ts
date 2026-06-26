import { describe, expect, it } from 'vitest';

import { validateEmail } from './email';

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('alex@example.com')).toBe(true);
  });

  it.each([
    ['missing @', 'alexexample.com'],
    ['missing domain dot', 'alex@example'],
    ['single-char TLD', 'alex@example.c'],
    ['contains a space', 'al ex@example.com'],
    ['empty string', '']
  ])('rejects %s', (_label, input) => {
    expect(validateEmail(input)).toBe(false);
  });
});
