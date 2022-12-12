import { useInfiniteQuery } from '@tanstack/react-query';

import { getNextLink } from 'soapbox/api';
import { useApi } from 'soapbox/hooks';
import { Account } from 'soapbox/types/entities';
import { flattenPages, PaginatedResult } from 'soapbox/utils/queries';

export default function useAccountSearch(q: string) {
  const api = useApi();

  const getAccountSearch = async(q: string, pageParam: { link?: string }): Promise<PaginatedResult<Account>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || '/api/v1/accounts/search';

    const response = await api.get(uri, {
      params: {
        q,
        limit: 10,
        followers: true,
      },
    });
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;

    return {
      result: data,
      link,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery(['search', 'accounts', q], ({ pageParam }) => getAccountSearch(q, pageParam), {
    keepPreviousData: true,
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data);

  return {
    ...queryInfo,
    data,
  };
}
