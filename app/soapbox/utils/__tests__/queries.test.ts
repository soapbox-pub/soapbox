import { InfiniteData } from '@tanstack/react-query';

import { queryClient } from 'soapbox/queries/client';

import { PaginatedResult, sortQueryData } from '../queries';

interface Item {
  id: number
}

const buildItem = (id: number): Item => ({ id });

const queryKey = ['test', 'query'];

describe('sortQueryData()', () => {
  describe('without cached data', () => {
    it('safely returns undefined', () => {
      sortQueryData<Item>(queryKey, (a, b) => b.id - a.id);
      const nextQueryData = queryClient.getQueryData<InfiniteData<PaginatedResult<Item>>>(queryKey);
      expect(nextQueryData).toBeUndefined();
    });
  });

  describe('with cached data', () => {
    const cachedQueryData = {
      pages: [
        {
          result: [...Array(20).fill(0).map((_, idx) => buildItem(idx))],
          hasMore: false,
          link: undefined,
        },
        {
          result: [...Array(4).fill(0).map((_, idx) => buildItem(idx + 20))],
          hasMore: true,
          link: 'my-link',
        },
      ],
      pageParams: [undefined],
    };

    beforeEach(() => {
      queryClient.setQueryData(queryKey, cachedQueryData);
    });

    it('sorts the cached data', () => {
      const initialQueryData = queryClient.getQueryData<InfiniteData<PaginatedResult<Item>>>(queryKey);
      expect(initialQueryData?.pages[0].result[0].id === 0); // first id is 0
      sortQueryData<Item>(queryKey, (a, b) => b.id - a.id); // sort descending
      const nextQueryData = queryClient.getQueryData<InfiniteData<PaginatedResult<Item>>>(queryKey);
      expect(nextQueryData?.pages[0].result[0].id === 0); // first id is now 23
    });

    it('persists the metadata', () => {
      const initialQueryData = queryClient.getQueryData<InfiniteData<PaginatedResult<Item>>>(queryKey);
      const initialMetaData = initialQueryData?.pages.map((page) => page.link);
      sortQueryData<Item>(queryKey, (a, b) => b.id - a.id);
      const nextQueryData = queryClient.getQueryData<InfiniteData<PaginatedResult<Item>>>(queryKey);
      const nextMetaData = nextQueryData?.pages.map((page) => page.link);

      expect(initialMetaData).toEqual(nextMetaData);
    });
  });
});