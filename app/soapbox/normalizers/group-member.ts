/**
 * Group Member normalizer:
 * Converts API group members into our internal format.
 */
import { BaseGroupRoles, TruthSocialGroupRoles } from 'soapbox/hooks/useGroupRoles';
import { Account } from 'soapbox/types/entities';

import { normalizeAccount } from './account';

export interface GroupMember {
  id: string
  role: BaseGroupRoles | TruthSocialGroupRoles
  account: Account | any
}

export const normalizeGroupMember = (groupMember: GroupMember): GroupMember => {
  return {
    ...groupMember,
    account: normalizeAccount(groupMember.account),
  };
};
