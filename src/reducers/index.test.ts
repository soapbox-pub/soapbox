import { Record as ImmutableRecord } from 'immutable';
import { describe, expect, it } from 'vitest';

import reducer from './index.ts';

describe('root reducer', () => {
  it('should return the initial state', () => {
    const result = reducer(undefined, {} as any);
    expect(ImmutableRecord.isRecord(result)).toBe(true);
    expect(result.instance.version).toEqual('0.0.0');
  });
});
