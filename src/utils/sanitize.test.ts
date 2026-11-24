import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize.ts';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html').body;

describe('sanitizeHtml()', () => {
  it('keeps Mastodon status markup', () => {
    const html = '<p>Hi <span class="h-card"><a href="https://example.com/@alex" class="u-url mention">@<span>alex</span></a></span> '
      + '<a href="https://example.com/tags/nostr" class="mention hashtag" rel="tag">#<span>nostr</span></a> '
      + '<a href="https://example.com/a/very/long/path" rel="nofollow noopener" target="_blank"><span class="invisible">https://</span><span class="ellipsis">example.com/a/very</span><span class="invisible">/long/path</span></a></p>';

    expect(sanitizeHtml(html)).toBe(html);
  });

  it('keeps formatting', () => {
    const html = '<h1>Title</h1><blockquote><p><strong>bold</strong> <em>em</em> <code>x</code></p></blockquote><ul><li>one</li></ul><pre><code>y</code></pre>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('removes scripts, event handlers and javascript: URLs', () => {
    const body = parse(sanitizeHtml('<a href="javascript:alert(1)">x</a><img src="x" onerror="alert(1)"><script>alert(1)</script><svg onload="alert(1)"></svg>'));

    expect(body.querySelector('a')?.hasAttribute('href')).toBe(false);
    expect(body.querySelector('img')?.hasAttribute('onerror')).toBe(false);
    expect(body.querySelector('script, svg')).toBeNull();
  });

  it('removes forms and inputs', () => {
    const body = parse(sanitizeHtml('<form action="https://evil.example"><input name="password"><button>Log in</button></form>'));
    expect(body.querySelector('form, input, button')).toBeNull();
    expect(body.textContent).toBe('Log in');
  });

  it('removes inline styles, ids and data attributes', () => {
    const body = parse(sanitizeHtml('<p id="root" style="position:fixed;inset:0" data-markup="1">x</p>'));
    const p = body.querySelector('p')!;

    expect(p.hasAttribute('style')).toBe(false);
    expect(p.hasAttribute('id')).toBe(false);
    expect(p.hasAttribute('data-markup')).toBe(false);
  });

  it('only keeps known classes', () => {
    const body = parse(sanitizeHtml('<p class="fixed inset-0 z-50">x</p><a href="https://example.com" class="mention fixed">y</a>'));

    expect(body.querySelector('p')?.hasAttribute('class')).toBe(false);
    expect(body.querySelector('a')?.getAttribute('class')).toBe('mention');
  });
});
