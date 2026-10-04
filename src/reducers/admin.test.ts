import { describe, expect, it } from 'vitest';

import reducer from './admin.ts';

describe('admin reducer', () => {
  it('should return the initial state', () => {
    const result = reducer(undefined, {} as any);
    expect(result.needsReboot).toBe(false);
  });
});
