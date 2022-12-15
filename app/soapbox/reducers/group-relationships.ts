import { Map as ImmutableMap } from 'immutable';

import {
  GROUP_CREATE_SUCCESS,
  GROUP_UPDATE_SUCCESS,
  GROUP_DELETE_SUCCESS,
  GROUP_RELATIONSHIPS_FETCH_SUCCESS,
  GROUP_JOIN_REQUEST,
  GROUP_JOIN_SUCCESS,
  GROUP_JOIN_FAIL,
  GROUP_LEAVE_REQUEST,
  GROUP_LEAVE_SUCCESS,
  GROUP_LEAVE_FAIL,
} from 'soapbox/actions/groups';
import { normalizeGroupRelationship } from 'soapbox/normalizers';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

type GroupRelationshipRecord = ReturnType<typeof normalizeGroupRelationship>;
type APIEntities = Array<APIEntity>;

type State = ImmutableMap<string, GroupRelationshipRecord>;

const normalizeRelationships = (state: State, relationships: APIEntities) => {
  relationships.forEach(relationship => {
    state = state.set(relationship.id, normalizeGroupRelationship(relationship));
  });

  return state;
};

export default function groupRelationships(state: State = ImmutableMap(), action: AnyAction) {
  switch (action.type) {
    case GROUP_CREATE_SUCCESS:
    case GROUP_UPDATE_SUCCESS:
      return state.set(action.group.id, normalizeGroupRelationship({ id: action.group.id, member: true, requested: false, role: 'admin' }));
    case GROUP_DELETE_SUCCESS:
      return state.delete(action.id);
    case GROUP_JOIN_REQUEST:
      return state.getIn([action.id, 'member']) ? state : state.setIn([action.id, action.locked ? 'requested' : 'member'], true);
    case GROUP_JOIN_FAIL:
      return state.setIn([action.id, action.locked ? 'requested' : 'member'], false);
    case GROUP_LEAVE_REQUEST:
      return state.setIn([action.id, 'member'], false);
    case GROUP_LEAVE_FAIL:
      return state.setIn([action.id, 'member'], true);
    case GROUP_JOIN_SUCCESS:
    case GROUP_LEAVE_SUCCESS:
      return normalizeRelationships(state, [action.relationship]);
    case GROUP_RELATIONSHIPS_FETCH_SUCCESS:
      return normalizeRelationships(state, action.relationships);
    default:
      return state;
  }
}
