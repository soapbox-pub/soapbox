import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockStore, rootState } from '@/jest/test-helpers.tsx';

import { loginWithCode } from './external-auth.ts';

describe('loginWithCode()', () => {
  beforeEach(() => {
    localStorage.setItem('soapbox:external:app', JSON.stringify({ client_id: 'id', client_secret: 'secret', redirect_uri: 'https://soapbox.test/login/external' }));
    localStorage.setItem('soapbox:external:baseurl', 'https://example.com');
    localStorage.setItem('soapbox:external:scopes', 'read write');
    localStorage.setItem('soapbox:external:state', 'expected');
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it.each([null, 'wrong'])('rejects a code with state %j without asking the server', async (state) => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(mockStore(rootState).dispatch(loginWithCode('code', state))).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('soapbox:external:app')).toBeNull();
  });

  it('rejects a code when no login was started', async () => {
    localStorage.clear();
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    await expect(mockStore(rootState).dispatch(loginWithCode('code', 'expected'))).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('exchanges the code when the state matches', async () => {
    const fetch = vi.fn(async (_request: Request) => new Response('{}', { status: 500 }));
    vi.stubGlobal('fetch', fetch);

    await mockStore(rootState).dispatch(loginWithCode('code', 'expected')).catch(() => {});

    const request = fetch.mock.calls[0][0];
    expect(request.url).toBe('https://example.com/oauth/token');
  });
});
