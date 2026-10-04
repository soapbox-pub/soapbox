import { produce } from 'immer';

import {
  GROUP_CREATE_SUCCESS,
  GROUP_UPDATE_SUCCESS,
  GROUP_DELETE_SUCCESS,
  GROUP_RELATIONSHIPS_FETCH_SUCCESS,
} from '@/actions/groups.ts';
import { normalizeGroupRelationship, type GroupRelationship } from '@/normalizers/group-relationship.ts';

import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

type APIEntities = Array<APIEntity>;

type State = Record<string, GroupRelationship>;

const normalizeRelationships = (state: State, relationships: APIEntities) => {
  return produce(state, draft => {
    relationships.forEach(relationship => {
      draft[relationship.id] = normalizeGroupRelationship(relationship);
    });
  });
};

export default function groupRelationships(state: State = {}, action: AnyAction): State {
  switch (action.type) {
    case GROUP_CREATE_SUCCESS:
    case GROUP_UPDATE_SUCCESS:
      return produce(state, draft => {
        draft[action.group.id] = normalizeGroupRelationship({ id: action.group.id, member: true, requested: false, role: 'admin' });
      });
    case GROUP_DELETE_SUCCESS:
      return produce(state, draft => {
        delete draft[action.id];
      });
    case GROUP_RELATIONSHIPS_FETCH_SUCCESS:
      return normalizeRelationships(state, action.relationships);
    default:
      return state;
  }
}
