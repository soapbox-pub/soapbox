import { describe, expect, it } from 'vitest';

import { decodeBase64 } from './base64';

describe('decodeBase64', () => {
  it('returns a uint8 array', () => {
    const arr = decodeBase64('dGVzdA==');
    expect(arr).toEqual(new Uint8Array([116, 101, 115, 116]));
  });
});
