import { describe, expect, it } from 'vitest';

import reducer from './settings.ts';

describe('settings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual({
      saved: true,
    });
  });
});
