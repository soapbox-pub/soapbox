import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

import { getNextLink } from 'soapbox/api';
import { useApi, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeGroup, normalizeGroupRelationship } from 'soapbox/normalizers';
import { Group, GroupRelationship } from 'soapbox/types/entities';
import { flattenPages, PaginatedResult } from 'soapbox/utils/queries';

const GroupKeys = {
  group: (id: string) => ['groups', 'group', id] as const,
  myGroups: (userId: string) => ['groups', userId] as const,
  pendingGroups: (userId: string) => ['groups', userId, 'pending'] as const,
  popularGroups: ['groups', 'popular'] as const,
  suggestedGroups: ['groups', 'suggested'] as const,
};

const useGroupsApi = () => {
  const api = useApi();

  const getGroupRelationships = async (ids: string[]) => {
    const queryString = ids.map((id) => `id[]=${id}`).join('&');
    const { data } = await api.get<GroupRelationship[]>(`/api/v1/groups/relationships?${queryString}`);

    return data;
  };

  const fetchGroups = async (endpoint: string, params: AxiosRequestConfig['params'] = {}) => {
    const response = await api.get<Group[]>(endpoint, {
      params,
    });
    const groups = [response.data].flat();
    const relationships = await getGroupRelationships(groups.map((group) => group.id));
    const result = groups.map((group) => {
      const relationship = relationships.find((relationship) => relationship.id === group.id);

      return normalizeGroup({
        ...group,
        relationship: relationship ? normalizeGroupRelationship(relationship) : null,
      });
    });

    return {
      response,
      groups: result,
    };
  };

  return { fetchGroups };
};

const useGroups = () => {
  const account = useOwnAccount();
  const features = useFeatures();
  const { fetchGroups } = useGroupsApi();

  const getGroups = async (pageParam?: any): Promise<PaginatedResult<Group>> => {
    const endpoint = '/api/v1/groups';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const { response, groups } = await fetchGroups(uri);

    const link = getNextLink(response);
    const hasMore = !!link;

    return {
      result: groups,
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

const usePendingGroups = () => {
  const features = useFeatures();
  const account = useOwnAccount();
  const { fetchGroups } = useGroupsApi();

  const getGroups = async (pageParam?: any): Promise<PaginatedResult<Group>> => {
    const endpoint = '/api/v1/groups';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const { response, groups } = await fetchGroups(uri, {
      pending: true,
    });

    const link = getNextLink(response);
    const hasMore = !!link;

    return {
      result: groups,
      hasMore,
      link,
    };
  };

  const queryInfo = useInfiniteQuery(
    GroupKeys.pendingGroups(account?.id as string),
    ({ pageParam }: any) => getGroups(pageParam),
    {
      enabled: !!account && features.groupsPending,
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

const useGroup = (id: string) => {
  const features = useFeatures();
  const { fetchGroups } = useGroupsApi();

  const getGroup = async () => {
    const { groups } = await fetchGroups(`/api/v1/groups/${id}`);
    return groups[0];
  };

  const queryInfo = useQuery<Group>(GroupKeys.group(id), getGroup, {
    enabled: features.groups && !!id,
  });

  return {
    ...queryInfo,
    group: queryInfo.data,
  };
};

export {
  useGroup,
  useGroups,
  usePendingGroups,
};
