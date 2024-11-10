import { Entities } from 'soapbox/entity-store/entities.ts';
import { useCreateEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { groupSchema } from 'soapbox/schemas/index.ts';

interface UpdateGroupParams {
  display_name?: string;
  note?: string;
  avatar?: File | '';
  header?: File | '';
  group_visibility?: string;
  discoverable?: boolean;
  tags?: string[];
}

function useUpdateGroup(groupId: string) {
  const api = useApi();

  const { createEntity, ...rest } = useCreateEntity([Entities.GROUPS], (params: UpdateGroupParams) => {
    return api.put(`/api/v1/groups/${groupId}`, params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, { schema: groupSchema });

  return {
    updateGroup: createEntity,
    ...rest,
  };
}

export { useUpdateGroup };
