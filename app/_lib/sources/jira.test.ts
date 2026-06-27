import { describe, expect, it } from 'vitest';

import { normalizeSite } from './jira';

describe('normalizeSite', () => {
  it.each([
    ['bare host', 'acme.atlassian.net', 'acme.atlassian.net'],
    ['https prefix', 'https://acme.atlassian.net', 'acme.atlassian.net'],
    ['http prefix', 'http://acme.atlassian.net', 'acme.atlassian.net'],
    ['trailing slash', 'acme.atlassian.net/', 'acme.atlassian.net'],
    ['prefix and trailing slash', 'https://acme.atlassian.net/', 'acme.atlassian.net']
  ])('strips protocol and trailing slash: %s', (_label, input, expected) => {
    expect(normalizeSite(input)).toBe(expected);
  });

  it('returns undefined when unset', () => {
    expect(normalizeSite(undefined)).toBeUndefined();
  });
});
