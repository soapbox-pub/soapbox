import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { defineMessages, useIntl } from 'react-intl';

import { getNextLink } from 'soapbox/api';
import { useApi, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeGroup, normalizeGroupRelationship } from 'soapbox/normalizers';
import toast from 'soapbox/toast';
import { Group, GroupRelationship } from 'soapbox/types/entities';
import { flattenPages, PaginatedResult } from 'soapbox/utils/queries';

import { queryClient } from './client';

const messages = defineMessages({
  joinSuccess: { id: 'group.join.success', defaultMessage: 'Group joined successfully!' },
  joinRequestSuccess: { id: 'group.join.request_success', defaultMessage: 'Requested to join the group' },
  leaveSuccess: { id: 'group.leave.success', defaultMessage: 'Left the group' },
});

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

const usePopularGroups = () => {
  const features = useFeatures();
  const { fetchGroups } = useGroupsApi();

  const getQuery = async () => {
    const { groups } = await fetchGroups('/api/v1/truth/trends/groups');

    return groups;
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
  const features = useFeatures();
  const { fetchGroups } = useGroupsApi();

  const getQuery = async () => {
    const { groups } = await fetchGroups('/api/v1/truth/suggestions/groups');

    return groups;
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

const useJoinGroup = () => {
  const api = useApi();
  const intl = useIntl();

  return useMutation((group: Group) => api.post<GroupRelationship>(`/api/v1/groups/${group.id}/join`), {
    onSuccess(_response, group) {
      queryClient.invalidateQueries(['groups']);
      toast.success(
        group.locked
          ? intl.formatMessage(messages.joinRequestSuccess)
          : intl.formatMessage(messages.joinSuccess),
      );
    },
  });
};

const useLeaveGroup = () => {
  const api = useApi();
  const intl = useIntl();

  return useMutation((group: Group) => api.post<GroupRelationship>(`/api/v1/groups/${group.id}/leave`), {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(intl.formatMessage(messages.leaveSuccess));
    },
  });
};

const useCancelMembershipRequest = () => {
  const api = useApi();
  const me = useOwnAccount();

  return useMutation((group: Group) => api.post(`/api/v1/groups/${group.id}/membership_requests/${me?.id}/reject`), {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

export {
  useCancelMembershipRequest,
  useGroup,
  useGroups,
  useJoinGroup,
  useLeaveGroup,
  usePendingGroups,
  usePopularGroups,
  useSuggestedGroups,
};
