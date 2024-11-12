import { describe, expect, it } from 'vitest';

import reducer from './trends.ts';

describe('trends reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      items: [],
      isLoading: false,
    });
  });
});
