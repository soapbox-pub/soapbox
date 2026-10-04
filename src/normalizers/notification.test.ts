import { describe, expect, it } from 'vitest';

import { normalizeNotification } from './notification.ts';

describe('normalizeNotification()', () => {
  it('normalizes an empty map', () => {
    const notification = {};
    const result = normalizeNotification(notification);

    expect(result.type).toEqual('');
    expect(result.account).toBe(null);
    expect(result.target).toBe(null);
    expect(result.status).toBe(null);
    expect(result.id).toEqual('');
  });
});
