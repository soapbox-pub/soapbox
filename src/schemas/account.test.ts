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

describe('accountSchema avatar and header', () => {
  it('replaces non-web URLs with the defaults', () => {
    const account = accountSchema.parse({
      id: '1',
      acct: 'alex',
      url: 'https://example.com/@alex',
      avatar: 'javascript:alert(1)',
      header: 'data:text/html,<script>alert(1)</script>',
    });

    expect(account.avatar).not.toContain('javascript:');
    expect(account.header).not.toContain('data:text/html');
    expect(account.avatar_static).toBe(account.avatar);
  });

  it('keeps https URLs', () => {
    const account = accountSchema.parse({
      id: '1',
      acct: 'alex',
      url: 'https://example.com/@alex',
      avatar: 'https://example.com/a.png',
      header: 'https://example.com/h.png',
    });

    expect(account.avatar).toBe('https://example.com/a.png');
    expect(account.header).toBe('https://example.com/h.png');
  });
});
