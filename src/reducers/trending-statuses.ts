import { OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord } from 'immutable';

import {
  TRENDING_STATUSES_FETCH_REQUEST,
  TRENDING_STATUSES_FETCH_SUCCESS,
  TRENDING_STATUSES_EXPAND_SUCCESS,
} from 'soapbox/actions/trending-statuses';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedSet<string>(),
  isLoading: false,
  next: null as string | null,
});

type State = ReturnType<typeof ReducerRecord>;
type APIEntities = Array<APIEntity>;

const toIds = (items: APIEntities) => ImmutableOrderedSet(items.map(item => item.id));

const importStatuses = (state: State, statuses: APIEntities, next: string|null) => {
  return state.withMutations(state => {
    state.update('items', list => list.concat(toIds(statuses)));
    state.set('isLoading', false);
    state.set('next', next ? next : null);
  });
};

export default function trending_statuses(state: State = ReducerRecord(), action: AnyAction) {
  switch (action.type) {
    case TRENDING_STATUSES_FETCH_REQUEST:
      return state.set('isLoading', true);
    case TRENDING_STATUSES_EXPAND_SUCCESS:
    case TRENDING_STATUSES_FETCH_SUCCESS:
      return importStatuses(state, action.statuses, action.next);
    default:
      return state;
  }
}
