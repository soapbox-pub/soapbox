import { describe, expect, it } from 'vitest';

import reducer from './me.ts';

describe('me reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(null);
  });
});
