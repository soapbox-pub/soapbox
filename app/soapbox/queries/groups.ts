import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { fetchGroupRelationships } from 'soapbox/actions/groups';
import { importFetchedGroups } from 'soapbox/actions/importer';
import { getNextLink } from 'soapbox/api';
import { useApi, useAppDispatch, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeGroup } from 'soapbox/normalizers';
import { Group } from 'soapbox/types/entities';
import { flattenPages, PaginatedResult } from 'soapbox/utils/queries';

const GroupKeys = {
  myGroups: (userId: string) => ['groups', userId] as const,
  popularGroups: ['groups', 'popular'] as const,
  suggestedGroups: ['groups', 'suggested'] as const,
};

const useGroups = () => {
  const api = useApi();
  const account = useOwnAccount();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const getGroups = async (pageParam?: any): Promise<PaginatedResult<Group>> => {
    const endpoint = '/api/v1/groups';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const response = await api.get<Group[]>(uri);
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;
    const result = data.map(normalizeGroup);

    // Note: Temporary while part of Groups is using Redux
    dispatch(importFetchedGroups(result));
    dispatch(fetchGroupRelationships(result.map((item) => item.id)));

    return {
      result,
      hasMore,
      link,
    };
  };

  const queryInfo = useInfiniteQuery(
    GroupKeys.myGroups(account?.id as string),
    ({ pageParam }: any) => getGroups(pageParam),
    {
      enabled: !!account && features.groups,
      keepPreviousData: true,
      getNextPageParam: (config) => {
        if (config?.hasMore) {
          return { nextLink: config?.link };
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

const usePopularGroups = () => {
  const api = useApi();
  const features = useFeatures();

  const getQuery = async () => {
    const { data } = await api.get<Group[]>('/api/mock/groups'); // '/api/v1/truth/trends/groups'
    const result = data.map(normalizeGroup);

    return result;
  };

  const queryInfo = useQuery<Group[]>(GroupKeys.popularGroups, getQuery, {
    enabled: features.groupsDiscovery,
    placeholderData: [],
  });

  return {
    groups: queryInfo.data || [],
    ...queryInfo,
  };
};

const useSuggestedGroups = () => {
  const api = useApi();
  const features = useFeatures();

  const getQuery = async () => {
    const { data } = await api.get<Group[]>('/api/mock/groups'); // /api/v1/truth/suggestions/groups
    const result = data.map(normalizeGroup);

    return result;
  };

  const queryInfo = useQuery<Group[]>(GroupKeys.suggestedGroups, getQuery, {
    enabled: features.groupsDiscovery,
    placeholderData: [],
  });

  return {
    groups: queryInfo.data || [],
    ...queryInfo,
  };
};

export { useGroups, usePopularGroups, useSuggestedGroups };
