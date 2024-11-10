import { expect, test } from 'vitest';

import { normalizeUsername } from './input.ts';

test('normalizeUsername', () => {
  expect(normalizeUsername('@alex')).toBe('alex');
  expect(normalizeUsername('alex@alexgleason.me')).toBe('alex@alexgleason.me');
  expect(normalizeUsername('@alex@gleasonator.com')).toBe('alex@gleasonator.com');
});