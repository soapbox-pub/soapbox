import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  logger: {
    // eslint-disable-next-line no-console
    log: console.log,
    warn: console.warn,
    error: () => { },
  },
  defaultOptions: {
    queries: {
      staleTime: 0,
      cacheTime: Infinity,
      retry: false,
    },
  },
});

export { queryClient };
