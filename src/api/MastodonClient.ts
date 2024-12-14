import { HTTPError } from './HTTPError.ts';
import { MastodonResponse } from './MastodonResponse.ts';

interface Opts {
  searchParams?: URLSearchParams | Record<string, string | number | boolean | string[] | number[] | boolean[] | null | undefined>;
  onUploadProgress?: (e: ProgressEvent) => void;
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
          .reduce<[string, string][]>((acc, [key, value]) => {
            if (Array.isArray(value)) {
              for (const v of value) {
                acc.push([`${key}[]`, String(v)]);
              }
            } else if (value !== undefined && value !== null) {
              acc.push([key, String(value)]);
            }
            return acc;
          }, []);

      url.search = new URLSearchParams(params).toString();
    }

    const headers = new Headers(opts.headers);

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    let body: BodyInit | undefined;

    if (data instanceof FormData) {
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

    const fetchPromise = this.fetch(request);

    if (opts.onUploadProgress) {
      MastodonClient.fakeProgress(fetchPromise, opts.onUploadProgress);
    }

    const response = MastodonResponse.fromResponse(await fetchPromise);

    if (!response.ok) {
      throw new HTTPError(response, request);
    }

    return response;
  }

  /**
   * `fetch` does not natively support upload progress. Implement a fake progress callback instead.
   * TODO: Replace this with: https://stackoverflow.com/a/69400632
   */
  private static async fakeProgress(promise: Promise<unknown>, cb: (e: ProgressEvent) => void) {
    const controller = new AbortController();

    let loaded = 0;
    const total = 100;

    cb(new ProgressEvent('loadstart', { lengthComputable: true, loaded, total }));

    promise.then(() => {
      loaded = 100;
      controller.abort();
      cb(new ProgressEvent('loadend', { lengthComputable: true, loaded, total }));
      cb(new ProgressEvent('load', { lengthComputable: true, loaded, total }));
    }).catch(() => {
      loaded = 0;
      controller.abort();
      cb(new ProgressEvent('loadend', { lengthComputable: true, loaded, total }));
      cb(new ProgressEvent('error', { lengthComputable: true, loaded, total }));
    });

    while (!controller.signal.aborted && loaded < 90) {
      await new Promise(resolve => setTimeout(resolve, 10));
      loaded += 10;
      cb(new ProgressEvent('progress', { lengthComputable: true, loaded, total }));
    }
  }

}