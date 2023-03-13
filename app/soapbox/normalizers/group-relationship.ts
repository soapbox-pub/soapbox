/**
 * Group relationship normalizer:
 * Converts API group relationships into our internal format.
 */
import {
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

export const GroupRelationshipRecord = ImmutableRecord({
  id: '',
  blocked_by: false,
  member: false,
  notifying: null,
  requested: false,
  role: null as 'admin' | 'moderator' | 'user' | null,
});

export const normalizeGroupRelationship = (relationship: Record<string, any>) => {
  return GroupRelationshipRecord(
    ImmutableMap(fromJS(relationship)),
  );
};
