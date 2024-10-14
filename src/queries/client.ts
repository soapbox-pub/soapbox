import { QueryClient } from '@tanstack/react-query';

import { HTTPError } from 'soapbox/api/HTTPError';

/** HTTP response codes to retry. */
const RETRY_CODES = [502, 503, 504, 521, 522];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      gcTime: Infinity,
      retry(failureCount: number, error: Error): boolean {
        if (error instanceof HTTPError) {
          const { response } = error;

          // TODO: Implement Retry-After.
          // const retryAfter = response.headers.get('Retry-After');

          if (RETRY_CODES.includes(response.status)) {
            return failureCount < 3;
          }
        }

        return false;
      },
    },
  },
});

export { queryClient };
