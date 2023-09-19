import { Map as ImmutableMap, Record as ImmutableRecord } from 'immutable';

import { GROUP_FETCH_FAIL, GROUP_DELETE_SUCCESS, GROUP_FETCH_REQUEST } from 'soapbox/actions/groups';
import { GROUPS_IMPORT } from 'soapbox/actions/importer';
import { normalizeGroup } from 'soapbox/normalizers';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

type GroupRecord = ReturnType<typeof normalizeGroup>;
type APIEntities = Array<APIEntity>;

const ReducerRecord = ImmutableRecord({
  isLoading: true,
  items: ImmutableMap<string, GroupRecord | false>({}),
});

type State = ReturnType<typeof ReducerRecord>;

const normalizeGroups = (state: State, groups: APIEntities) =>
  state.update('items', items =>
    groups.reduce((items: ImmutableMap<string, GroupRecord | false>, group) =>
      items.set(group.id, normalizeGroup(group)), items),
  ).set('isLoading', false);

export default function groups(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case GROUPS_IMPORT:
      return normalizeGroups(state, action.groups);
    case GROUP_FETCH_REQUEST:
      return state.set('isLoading', true);
    case GROUP_DELETE_SUCCESS:
    case GROUP_FETCH_FAIL:
      return state
        .setIn(['items', action.id], false)
        .set('isLoading', false);
    default:
      return state;
  }
}
