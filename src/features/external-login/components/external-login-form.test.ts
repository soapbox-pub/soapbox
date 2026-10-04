import { describe, expect, it } from 'vitest';

import { normalizeHost } from './external-login-form.tsx';

describe('normalizeHost', () => {
  it('passes a bare domain through', () => {
    expect(normalizeHost('mastodon.social')).toBe('mastodon.social');
  });

  it('strips the scheme and path from a URL', () => {
    expect(normalizeHost('https://Mastodon.Social/about')).toBe('mastodon.social');
  });

  it('keeps the port from a URL', () => {
    expect(normalizeHost('http://localhost:4000')).toBe('localhost:4000');
  });

  it('takes the domain from a handle', () => {
    expect(normalizeHost(' @alex@gleasonator.dev ')).toBe('gleasonator.dev');
  });
});
