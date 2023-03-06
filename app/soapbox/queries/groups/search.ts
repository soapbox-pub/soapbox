import { useInfiniteQuery } from '@tanstack/react-query';

import { getNextLink } from 'soapbox/api';
import { useApi, useFeatures } from 'soapbox/hooks';
import { normalizeGroup } from 'soapbox/normalizers';
import { Group } from 'soapbox/types/entities';
import { flattenPages, PaginatedResult } from 'soapbox/utils/queries';

const GroupSearchKeys = {
  search: (query?: string) => query ? ['groups', 'search', query] : ['groups', 'search'] as const,
};

type PageParam = {
  link: string
}

const useGroupSearch = (search?: string) => {
  const api = useApi();
  const features = useFeatures();

  const getSearchResults = async (pageParam: PageParam): Promise<PaginatedResult<Group>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || '/api/v1/groups/search';
    const response = await api.get<Group[]>(uri, {
      params: search ? {
        q: search,
      } : undefined,
    });
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;
    const result = data.map(normalizeGroup);

    return {
      result,
      hasMore,
      link,
    };
  };

  const queryInfo = useInfiniteQuery(
    GroupSearchKeys.search(search),
    ({ pageParam }) => getSearchResults(pageParam),
    {
      keepPreviousData: true,
      enabled: features.groups && !!search,
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
    groups: data || [],
  };
};

export {
  useGroupSearch,
};
