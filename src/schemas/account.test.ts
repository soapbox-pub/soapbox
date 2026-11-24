import { describe, expect, it } from 'vitest';

import { accountSchema } from './account.ts';

describe('accountSchema', () => {
  it('sanitizes profile field values', () => {
    const account = accountSchema.parse({
      id: '1',
      acct: 'alex',
      url: 'https://example.com/@alex',
      fields: [{
        name: 'Website',
        value: '<a href="javascript:alert(1)">click</a> <a href="https://example.com" rel="me">example.com</a><img src=x onerror=alert(2)>',
      }],
    });

    const value = new DOMParser().parseFromString(account.fields[0]!.value, 'text/html').body;
    const [unsafe, safe] = value.querySelectorAll('a');

    expect(unsafe.hasAttribute('href')).toBe(false);
    expect(safe.getAttribute('href')).toBe('https://example.com');
    expect(safe.getAttribute('rel')).toBe('me');
    expect(value.querySelector('img')?.hasAttribute('onerror')).toBe(false);
  });
});
