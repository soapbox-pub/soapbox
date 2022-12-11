import { Map as ImmutableMap } from 'immutable';

import { GROUP_FETCH_FAIL, GROUP_DELETE_SUCCESS } from 'soapbox/actions/groups';
import { GROUPS_IMPORT } from 'soapbox/actions/importer';
import { normalizeGroup } from 'soapbox/normalizers';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

type GroupRecord = ReturnType<typeof normalizeGroup>;
type APIEntities = Array<APIEntity>;

type State = ImmutableMap<string, GroupRecord | false>;

const normalizeGroups = (state: State, relationships: APIEntities) => {
  relationships.forEach(relationship => {
    state = state.set(relationship.id, normalizeGroup(relationship));
  });

  return state;
};

export default function groups(state: State = ImmutableMap(), action: AnyAction) {
  switch (action.type) {
    case GROUPS_IMPORT:
      return normalizeGroups(state, action.groups);
    case GROUP_DELETE_SUCCESS:
    case GROUP_FETCH_FAIL:
      return state.set(action.id, false);
    default:
      return state;
  }
}
