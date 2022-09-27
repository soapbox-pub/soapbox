import { queryClient } from 'soapbox/queries/client';

import type { InfiniteData, QueryKey, UseInfiniteQueryResult } from '@tanstack/react-query';

export interface PaginatedResult<T> {
  result: T[],
  hasMore: boolean,
  link?: string,
}

/** Flatten paginated results into a single array. */
const flattenPages = <T>(queryInfo: UseInfiniteQueryResult<PaginatedResult<T>>) => {
  return queryInfo.data?.pages.reduce<T[]>(
    (prev: T[], curr) => [...prev, ...curr.result],
    [],
  );
};

/** Traverse pages and update the item inside if found. */
const updatePageItem = <T>(queryKey: QueryKey, newItem: T, isItem: (item: T, newItem: T) => boolean) => {
  queryClient.setQueriesData<InfiniteData<PaginatedResult<T>>>(queryKey, (data) => {
    if (data) {
      const pages = data.pages.map(page => {
        const result = page.result.map(item => isItem(item, newItem) ? newItem : item);
        return { ...page, result };
      });
      return { ...data, pages };
    }
  });
};

/** Insert the new item at the beginning of the first page. */
const appendPageItem = <T>(queryKey: QueryKey, newItem: T) => {
  queryClient.setQueryData<InfiniteData<PaginatedResult<T>>>(queryKey, (data) => {
    if (data) {
      const pages = [...data.pages];
      pages[0] = { ...pages[0], result: [...pages[0].result, newItem] };
      return { ...data, pages };
    }
  });
};

/** Remove an item inside if found. */
const removePageItem = <T>(queryKey: QueryKey, itemToRemove: T, isItem: (item: T, newItem: T) => boolean) => {
  queryClient.setQueriesData<InfiniteData<PaginatedResult<T>>>(queryKey, (data) => {
    if (data) {
      const pages = data.pages.map(page => {
        const result = page.result.filter(item => !isItem(item, itemToRemove));
        return { ...page, result };
      });
      return { ...data, pages };
    }
  });
};

export {
  flattenPages,
  updatePageItem,
  appendPageItem,
  removePageItem,
};
