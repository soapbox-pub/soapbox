import { describe, expect, it } from 'vitest';

import { httpUrlSchema } from '@/schemas/utils.ts';

import { isSafeUrl, safeUrl } from './url.ts';

describe('isSafeUrl', () => {
  it('allows web URLs', () => {
    expect(isSafeUrl('https://example.com/a')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
    expect(isSafeUrl('/packs/emoji.svg')).toBe(true);
  });

  it('rejects script and data URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl(' JavaScript:alert(1)')).toBe(false);
    expect(isSafeUrl('java\tscript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl(null)).toBe(false);
  });

  it('returns an empty string for unsafe URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('https://example.com')).toBe('https://example.com');
  });
});

describe('httpUrlSchema', () => {
  it('only accepts absolute http(s) URLs', () => {
    expect(httpUrlSchema.safeParse('https://example.com').success).toBe(true);
    expect(httpUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(httpUrlSchema.safeParse('/relative').success).toBe(false);
  });
});
