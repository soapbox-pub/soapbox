import { beforeEach, describe, expect, it } from 'vitest';

import { __stub } from 'soapbox/api/index.ts';
import { buildGroupMember } from 'soapbox/jest/factory.ts';
import { renderHook, waitFor } from 'soapbox/jest/test-helpers.tsx';
import { GroupRoles } from 'soapbox/schemas/group-member.ts';

import { useGroupMembers } from './useGroupMembers.ts';

const groupMember = buildGroupMember();
const groupId = '1';

describe('useGroupMembers hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/groups/${groupId}/memberships?role=${GroupRoles.ADMIN}`).reply(200, [groupMember]);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useGroupMembers(groupId, GroupRoles.ADMIN));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groupMembers.length).toBe(1);
      expect(result.current.groupMembers[0].id).toBe(groupMember.id);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/groups/${groupId}/memberships?role=${GroupRoles.ADMIN}`).networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useGroupMembers(groupId, GroupRoles.ADMIN));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groupMembers.length).toBe(0);
      expect(result.current.isError).toBeTruthy();
    });
  });
});