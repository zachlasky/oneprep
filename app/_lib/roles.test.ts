import { describe, expect, it } from 'vitest';

import { isRole } from './roles';

describe('isRole', () => {
  it('accepts every defined role value', () => {
    for (const value of ['skip-level-manager', 'manager', 'peer', 'direct-report', 'skip-level-report']) {
      expect(isRole(value)).toBe(true);
    }
  });

  it.each([
    ['unknown value', 'cto'],
    ['empty string', ''],
    ['undefined', undefined],
    ['a label rather than a value', 'Manager']
  ])('rejects %s', (_label, input) => {
    expect(isRole(input)).toBe(false);
  });
});
