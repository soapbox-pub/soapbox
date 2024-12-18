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
          .reduce<URLSearchParams>((acc, [key, value]) => {
            if (Array.isArray(value)) {
              for (const v of value) {
                acc.append(`${key}[]`, String(v));
              }
            } else if (value !== undefined && value !== null) {
              acc.append(key, String(value));
            }
            return acc;
          }, new URLSearchParams());

      // Merge search params.
      // If a key exists in the URL, it will be replaced. Otherwise it will be added.
      for (const key of params.keys()) {
        url.searchParams.delete(key);
      }
      for (const [key, value] of params) {
        url.searchParams.append(key, value);
      }
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

    const response = opts.onUploadProgress
      ? await this.xhr(request, opts)
      : MastodonResponse.fromResponse(await this.fetch(request));

    if (!response.ok) {
      throw new HTTPError(response, request);
    }

    return response;
  }

  /**
   * Perform an XHR request from the native `Request` object and get back a `MastodonResponse`.
   * This is needed because unfortunately `fetch` does not support upload progress.
   */
  private async xhr(request: Request, opts: Opts = {}): Promise<MastodonResponse> {
    const xhr = new XMLHttpRequest();
    const { resolve, reject, promise } = Promise.withResolvers<MastodonResponse>();

    xhr.responseType = 'arraybuffer';

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      const headers = new Headers(
        xhr.getAllResponseHeaders()
          .trim()
          .split(/[\r\n]+/)
          .map((line): [string, string] => {
            const [name, ...rest] = line.split(': ');
            const value = rest.join(': ');
            return [name, value];
          }),
      );

      const response = new MastodonResponse(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers,
      });

      resolve(response);
    };

    xhr.onerror = () => {
      reject(new TypeError('Network request failed'));
    };

    xhr.onabort = () => {
      reject(new DOMException('The request was aborted', 'AbortError'));
    };

    if (opts.onUploadProgress) {
      xhr.upload.onprogress = opts.onUploadProgress;
    }

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.open(request.method, request.url, true);

    for (const [name, value] of request.headers) {
      xhr.setRequestHeader(name, value);
    }

    xhr.send(await request.arrayBuffer());

    return promise;
  }

}