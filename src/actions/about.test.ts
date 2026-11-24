import { afterEach, describe, expect, it, vi } from 'vitest';

import { mockStore, rootState } from '@/jest/test-helpers.tsx';

import { fetchAboutPage } from './about.ts';

describe('fetchAboutPage()', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the page and sanitizes it', async () => {
    const fetch = vi.fn(async (_request: Request) => new Response('<h1>Hi</h1><img src="x" onerror="alert(1)">'));
    vi.stubGlobal('fetch', fetch);

    const html = await mockStore(rootState).dispatch(fetchAboutPage('rules', 'pt-BR'));

    const request = fetch.mock.calls[0][0];
    expect(new URL(request.url).pathname).toBe('/instance/about/rules.pt-BR.html');
    expect(html).toContain('<h1>Hi</h1>');
    expect(html).not.toContain('onerror');
  });

  it.each([
    '..\\..\\media\\abc\\payload',
    '../../media/payload',
    '..',
    'a.b',
  ])('rejects the slug %j without making a request', async (slug) => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(mockStore(rootState).dispatch(fetchAboutPage(slug))).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects an unsafe locale', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(mockStore(rootState).dispatch(fetchAboutPage('about', '..\\x'))).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
