import LinkHeader from 'http-link-header';

interface Pagination {
  next?: string;
  prev?: string;
}

export function getPagination(response: Response): Pagination {
  const header = response.headers.get('link');
  const links = header ? new LinkHeader(header) : undefined;

  return {
    next: links?.refs.find((link) => link.rel === 'next')?.uri,
    prev: links?.refs.find((link) => link.rel === 'prev')?.uri,
  };
}
