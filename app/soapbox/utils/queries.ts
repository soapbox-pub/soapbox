import { queryClient } from 'soapbox/queries/client';

import type { InfiniteData, QueryKey } from '@tanstack/react-query';

export interface PaginatedResult<T> {
  result: T[],
  hasMore: boolean,
  link?: string,
}

/** Deduplicate an array of entities by their ID. */
const deduplicate = <T>(entities: T[]): T[] => {
  const map = entities.reduce<Map<string, T>>((result, entity) => {
    // @ts-expect-error Entity might not have an ID... but it probably does.
    return result.set(entity.id, entity);
  }, new Map());

  return Array.from(map.values());
};

/** Flatten paginated results into a single array. */
const flattenPages = <T>(queryData: InfiniteData<PaginatedResult<T>> | undefined) => {
  const data = queryData?.pages.reduce<T[]>(
    // FIXME: Pleroma wants these to be reversed for Chats.
    (prev: T[], curr) => [...curr.result, ...prev],
    [],
  );

  if (data) {
    return deduplicate<T>(data);
  }
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

const paginateQueryData = <T>(array: T[] | undefined) => {
  return array?.reduce((resultArray: any, item: any, index: any) => {
    const chunkIndex = Math.floor(index / 20);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};

const sortQueryData = <T>(queryKey: QueryKey, comparator: (a: T, b: T) => number) => {
  queryClient.setQueryData<InfiniteData<PaginatedResult<T>>>(queryKey, (prevResult) => {
    if (prevResult) {
      const nextResult = { ...prevResult };
      const flattenedQueryData = flattenPages(nextResult);
      const sortedQueryData = flattenedQueryData?.sort(comparator);
      const paginatedPages = paginateQueryData(sortedQueryData);
      const newPages = paginatedPages.map((page: T, idx: number) => ({
        ...prevResult.pages[idx],
        result: page,
      }));

      nextResult.pages = newPages;
      return nextResult;
    }
  });
};

export {
  flattenPages,
  updatePageItem,
  appendPageItem,
  removePageItem,
  sortQueryData,
};
