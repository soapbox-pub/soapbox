import { HTTPError } from './HTTPError.ts';
import { MastodonResponse } from './MastodonResponse.ts';

interface Opts {
  searchParams?: URLSearchParams | Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class MastodonClient {

  readonly baseUrl: string;

  private fetch: typeof fetch;
  private accessToken?: string;

  constructor(baseUrl: string, accessToken?: string, fetch = globalThis.fetch.bind(globalThis)) {
    this.fetch = fetch;
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  async get(path: string, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('GET', path, undefined, opts);
  }

  async post(path: string, data?: unknown, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('POST', path, data, opts);
  }

  async put(path: string, data?: unknown, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('PUT', path, data, opts);
  }

  async delete(path: string, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('DELETE', path, undefined, opts);
  }

  async patch(path: string, data: unknown, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('PATCH', path, data, opts);
  }

  async head(path: string, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('HEAD', path, undefined, opts);
  }

  async options(path: string, opts: Opts = {}): Promise<MastodonResponse> {
    return this.request('OPTIONS', path, undefined, opts);
  }

  async request(method: string, path: string, data: unknown, opts: Opts = {}): Promise<MastodonResponse> {
    const url = new URL(path, this.baseUrl);

    if (opts.searchParams) {
      const params = opts.searchParams instanceof URLSearchParams
        ? opts.searchParams
        : Object
          .entries(opts.searchParams)
          .map(([key, value]) => ([key, String(value)]));

      url.search = new URLSearchParams(params).toString();
    }

    const headers = new Headers(opts.headers);

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    let body: BodyInit | undefined;

    if (data instanceof FormData) {
      headers.set('Content-Type', 'multipart/form-data');
      body = data;
    } else if (data !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(data);
    }

    const request = new Request(url, {
      method,
      headers,
      signal: opts.signal,
      body,
    });

    const response = await this.fetch(request);

    if (!response.ok) {
      throw new HTTPError(response, request);
    }

    // Fix for non-compliant browsers.
    // https://developer.mozilla.org/en-US/docs/Web/API/Response/body
    if (response.status === 204 || request.method === 'HEAD') {
      return new MastodonResponse(null, response);
    }

    return new MastodonResponse(response.body, response);
  }

}