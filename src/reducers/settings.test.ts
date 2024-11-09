import { Map as ImmutableMap } from 'immutable';
import { describe, expect, it } from 'vitest';

import reducer from './settings';

describe('settings reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(ImmutableMap({
      saved: true,
    }));
  });
});
