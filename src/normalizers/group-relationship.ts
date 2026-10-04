/**
 * Group relationship normalizer:
 * Converts API group relationships into our internal format.
 */
import { fromDefaults } from '@/utils/normalizers.ts';

import type { GroupRoles } from '@/schemas/group-member.ts';

export interface GroupRelationship {
  id: string;
  blocked_by: boolean;
  member: boolean;
  notifying: boolean | null;
  requested: boolean;
  muting: boolean;
  role: GroupRoles;
  pending_requests: boolean;
}

export const normalizeGroupRelationship = (relationship: Record<string, any>): GroupRelationship => {
  return fromDefaults<GroupRelationship>({
    id: '',
    blocked_by: false,
    member: false,
    notifying: null,
    requested: false,
    muting: false,
    role: 'user' as GroupRoles,
    pending_requests: false,
  }, relationship);
};
