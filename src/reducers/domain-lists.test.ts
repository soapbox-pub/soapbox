import { describe, expect, it } from 'vitest';

import reducer from './domain-lists.ts';

describe('domain_lists reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      blocks: {
        items: [],
        next: null,
      },
    });
  });
});
