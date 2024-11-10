import { List as ImmutableList } from 'immutable';
import { describe, expect, it } from 'vitest';

import reducer from './filters.ts';

describe('filters reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(ImmutableList());
  });
});
