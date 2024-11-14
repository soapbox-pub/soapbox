import LinkHeader from 'http-link-header';

export class MastodonResponse extends Response {

  /** Parses the `Link` header and returns URLs for the `prev` and `next` pages of this response, if any. */
  pagination(): { prev?: string; next?: string } {
    const header = this.headers.get('link');
    const links = header ? new LinkHeader(header) : undefined;

    return {
      next: links?.refs.find((link) => link.rel === 'next')?.uri,
      prev: links?.refs.find((link) => link.rel === 'prev')?.uri,
    };
  }

}
