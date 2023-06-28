import { useQuery } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

import { useApi, useFeatures } from 'soapbox/hooks';
import { normalizeGroup, normalizeGroupRelationship } from 'soapbox/normalizers';
import { Group, GroupRelationship } from 'soapbox/types/entities';

const GroupKeys = {
  group: (id: string) => ['groups', 'group', id] as const,
  pendingGroups: (userId: string) => ['groups', userId, 'pending'] as const,
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
};
