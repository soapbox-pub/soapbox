import { describe, expect, it } from 'vitest';

import reducer from './lists.ts';

describe('lists reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual({});
  });
});
